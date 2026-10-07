"""Build a static Pages preview; preserve the PHP form source for Hostinger."""
from pathlib import Path
import os
import shutil

root = Path(__file__).resolve().parent.parent
out = root / '_site'
out.mkdir(exist_ok=True)
base = os.environ.get('SITE_URL', 'https://carlosjunior2007.github.io/dominguez-landscaping').rstrip('/')
for name in ['index.html', 'contact.html', 'contact.js', 'setup.js', 'favicon.ico', 'site.webmanifest', 'robots.txt', 'sitemap.xml']:
    shutil.copy2(root / name, out / name)
shutil.copytree(root / 'assets', out / 'assets', dirs_exist_ok=True)
for name in ['index.html', 'contact.html', 'robots.txt', 'sitemap.xml']:
    path = out / name
    path.write_text(path.read_text().replace('https://YOUR-DOMAIN.com', base))

# Preserve the final form design; contact.js prevents sending on this static preview.
path = out / 'contact.html'
html = path.read_text()
start = '<form id="quoteForm" class="mt-8" action="get-quote.php" method="POST" novalidate>'
replacement = '<form id="quoteForm" class="mt-8" novalidate data-preview="true">'
assert start in html
html = html.replace(start, replacement)
path.write_text(html)
(out / '.nojekyll').touch()
print(f'Built Pages preview: {base}/')
