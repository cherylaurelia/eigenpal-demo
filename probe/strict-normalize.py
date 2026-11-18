"""Write a copy of each Strict DOCX with ECMA-376 Strict names replaced by Transitional ones,
from an explicit table (independent of the patch's rule), so compare2.py can diff it."""
import sys, zipfile, os
T = 'http://schemas.openxmlformats.org/'
S = 'http://purl.oclc.org/ooxml/'
TABLE = {
  'officeDocument/relationships/extendedProperties': 'officeDocument/2006/relationships/extended-properties',
  'officeDocument/relationships/metadata/thumbnail': 'package/2006/relationships/metadata/thumbnail',
  'officeDocument/extendedProperties': 'officeDocument/2006/extended-properties',
  'officeDocument/docPropsVTypes': 'officeDocument/2006/docPropsVTypes',
  'officeDocument/relationships': 'officeDocument/2006/relationships',
  'officeDocument/math': 'officeDocument/2006/math',
  'wordprocessingml/main': 'wordprocessingml/2006/main',
  'drawingml/main': 'drawingml/2006/main',
  'drawingml/diagram': 'drawingml/2006/diagram',
  'drawingml/wordprocessingDrawing': 'drawingml/2006/wordprocessingDrawing',
  'drawingml/picture': 'drawingml/2006/picture',
  'drawingml/chart': 'drawingml/2006/chart',
}
src, dst = sys.argv[1], sys.argv[2]
for f in sorted(os.listdir(src)):
    if not f.endswith('.docx'): continue
    zi = zipfile.ZipFile(os.path.join(src, f))
    with zipfile.ZipFile(os.path.join(dst, f), 'w', zipfile.ZIP_DEFLATED) as zo:
        for n in zi.namelist():
            data = zi.read(n)
            if n.endswith('.xml') or n.endswith('.rels'):
                s = data.decode('utf-8')
                for k in sorted(TABLE, key=len, reverse=True):  # longest first
                    s = s.replace('"' + S + k, '"' + T + TABLE[k])
                assert S not in s, (f, n, s[s.index(S):s.index(S)+80])
                data = s.encode('utf-8')
            zo.writestr(n, data)
