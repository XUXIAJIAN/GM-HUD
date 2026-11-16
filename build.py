from pathlib import Path
import json
p=Path(__file__).parent
core=(p/'core.js').read_text()
app=(p/'app.js').read_text()
bundle='window.HUD_BUNDLE='+json.dumps([core,app],ensure_ascii=False).replace('<','\\u003c')+';'
(p/'bundle.js').write_text(bundle)
s=(p/'index.html').read_text()
for name in ['vendor/xlsx.full.min.js','bundle.js','core.js','demo.js','app.js']:
    content=(p/name).read_text().replace('</script','<\\/script')
    s=s.replace('<script src="'+name+'"></script>','<script>'+content+'</script>')
(p/'HUD分析工具.html').write_text(s)
