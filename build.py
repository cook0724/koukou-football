"""Build index.html from src/: inlines the engine, kit designer and UI scripts into the HTML shell."""
from pathlib import Path
src = Path(__file__).parent / 'src'
html = (src / 'shell.html').read_text(encoding='utf-8')
for key, name in (('ENGINE', 'engine.js'), ('KIT', 'kit.js'), ('UI', 'ui.js')):
    html = html.replace(f'/*{key}*/', (src / name).read_text(encoding='utf-8'))
(Path(__file__).parent / 'index.html').write_text(html, encoding='utf-8')
print('index.html built')
