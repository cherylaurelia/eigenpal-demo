"""Original vs saved DOCX, ignoring known-harmless differences:
mc:Ignorable order, renumbered ids, the _GoBack bookmark, o:gfxdata, whitespace in
w:t without xml:space=preserve, ZIP directory entries. Allows one typed 'Z' (edit runs)."""
import sys, zipfile, json, collections, os, re
import xml.etree.ElementTree as ET
XS = '{http://www.w3.org/XML/1998/namespace}space'
W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
IGNORE_ATTR = re.compile(r'(Ignorable|^id$|gfxdata|^rsid|paraId|textId|durableId)')

def stats(data):
    tags = collections.Counter(); attrs = collections.Counter(); text = []
    root = ET.fromstring(data)
    gob = set()
    for el in root.iter():
        if el.tag == W+'bookmarkStart' and el.get(W+'name') == '_GoBack': gob.add(el.get(W+'id'))
    for el in root.iter():
        if el.tag in (W+'bookmarkStart', W+'bookmarkEnd') and el.get(W+'id') in gob: continue
        tags[el.tag] += 1
        for k, v in el.attrib.items():
            ln = k.split('}')[-1]
            if IGNORE_ATTR.search(ln): continue
            attrs[(el.tag, ln, v)] += 1
        if el.tag == W+'t' and el.text:
            text.append(el.text if el.get(XS) == 'preserve' else el.text.strip())
    return tags, attrs, ''.join(text)

def compare(orig, saved, edited):
    zo, zs = zipfile.ZipFile(orig), zipfile.ZipFile(saved)
    so = {n for n in zo.namelist() if not n.endswith('/')}; ss = set(zs.namelist())
    rep = {}
    if so - ss: rep['missing_parts'] = sorted(so - ss)
    for name in sorted(so & ss):
        if not (name.endswith('.xml') or name.endswith('.rels')):
            if zo.read(name) != zs.read(name): rep.setdefault('binary_changed', []).append(name)
            continue
        try:
            to, ao, xo = stats(zo.read(name)); ts, as_, xs = stats(zs.read(name))
        except ET.ParseError: continue
        lt = {k.split('}')[-1]: to[k] - ts.get(k, 0) for k in to if to[k] > ts.get(k, 0)}
        la = {f"{t.split('}')[-1]}@{a}={v[:40]}": ao[(t, a, v)] - as_.get((t, a, v), 0)
              for (t, a, v) in ao if ao[(t, a, v)] > as_.get((t, a, v), 0)}
        if lt: rep.setdefault('lost_tags', {})[name] = lt
        if la: rep.setdefault('lost_attrs', {})[name] = la
        if xo != xs:
            if edited and name == 'word/document.xml' and xs.replace('Z', '', 1) == xo: pass
            else:
                import difflib
                sm = difflib.SequenceMatcher(None, xo, xs, autojunk=False)
                ops = [(t, xo[i1:i2][:60], xs[j1:j2][:60]) for t, i1, i2, j1, j2 in sm.get_opcodes() if t != 'equal']
                rep.setdefault('text_changed', {})[name] = {'orig_len': len(xo), 'saved_len': len(xs), 'ops': ops[:6]}
    return rep

if __name__ == '__main__':
    orig_dir, saved_dir, mode = sys.argv[1], sys.argv[2], sys.argv[3]
    out = {}
    for f in sorted(os.listdir(saved_dir)):
        if f.endswith('.docx'):
            try: out[f] = compare(os.path.join(orig_dir, f), os.path.join(saved_dir, f), mode == 'edit')
            except Exception as e: out[f] = {'error': str(e)}
    json.dump(out, open(os.path.join(saved_dir, '_compare2.json'), 'w'), indent=1)
    n = lambda k: sum(1 for r in out.values() if r.get(k))
    print(saved_dir, 'files', len(out), {k: n(k) for k in ('missing_parts', 'binary_changed', 'lost_tags', 'lost_attrs', 'text_changed', 'error')})
