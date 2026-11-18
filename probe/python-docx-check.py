import sys, os, docx
d_in, d_out = sys.argv[1], sys.argv[2]
for f in sorted(os.listdir(d_in)):
    if not f.endswith('.docx'): continue
    res = []
    for d in (d_in, d_out):
        try:
            doc = docx.Document(os.path.join(d, f))
            res.append(f"ok {len(doc.paragraphs)} paras {sum(len(p.text) for p in doc.paragraphs)} chars")
        except Exception as e:
            res.append(f"FAIL {type(e).__name__}: {str(e)[:70]}")
    print(f, '| original:', res[0], '| saved:', res[1])
