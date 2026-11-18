"""Compare an original DOCX with its saved copy: parts, elements, attributes, text.
Reports only what the saved copy lost (count dropped) or changed."""
import sys, zipfile, json, collections, os
import xml.etree.ElementTree as ET

def stats(data):
    tags = collections.Counter(); attrs = collections.Counter(); text = []
    root = ET.fromstring(data)
    for el in root.iter():
        tags[el.tag] += 1
        for k, v in el.attrib.items():
            attrs[(el.tag, k, v)] += 1
        if el.tag.endswith('}t') and el.text:
            text.append(el.text)
    return tags, attrs, ''.join(text)

def compare(orig, saved):
    zo, zs = zipfile.ZipFile(orig), zipfile.ZipFile(saved)
    so = set(zo.namelist()); ss = set(zs.namelist())
    rep = {'missing_parts': sorted(so - ss), 'lost_tags': {}, 'lost_attrs': {}, 'text_changed': []}
    for name in sorted(so & ss):
        if not (name.endswith('.xml') or name.endswith('.rels')):
            if zo.read(name) != zs.read(name): rep.setdefault('binary_changed', []).append(name)
            continue
        try:
            to, ao, xo = stats(zo.read(name)); ts, as_, xs = stats(zs.read(name))
        except ET.ParseError as e:
            rep.setdefault('parse_error', []).append(f'{name}: {e}'); continue
        lt = {k.split('}')[-1]: to[k] - ts.get(k, 0) for k in to if to[k] > ts.get(k, 0)}
        la = {f"{t.split('}')[-1]}@{a.split('}')[-1]}={v}": ao[(t, a, v)] - as_.get((t, a, v), 0)
              for (t, a, v) in ao if ao[(t, a, v)] > as_.get((t, a, v), 0)}
        if lt: rep['lost_tags'][name] = lt
        if la: rep['lost_attrs'][name] = la
        if xo != xs: rep['text_changed'].append(name)
    return rep

if __name__ == '__main__':
    orig_dir, saved_dir = sys.argv[1], sys.argv[2]
    out = {}
    for f in sorted(os.listdir(saved_dir)):
        if not f.endswith('.docx'): continue
        try: out[f] = compare(os.path.join(orig_dir, f), os.path.join(saved_dir, f))
        except Exception as e: out[f] = {'error': str(e)}
    json.dump(out, open(os.path.join(saved_dir, '_compare.json'), 'w'), indent=1)
    bad = {f: r for f, r in out.items() if r.get('error') or r.get('missing_parts') or r.get('lost_tags') or r.get('text_changed') or r.get('binary_changed') or r.get('parse_error')}
    print('files', len(out), 'with tag/text/part loss', len(bad), 'with attr-only diffs', sum(1 for f, r in out.items() if f not in bad and r.get('lost_attrs')))
