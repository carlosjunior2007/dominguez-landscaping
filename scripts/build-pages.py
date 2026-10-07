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

# Pages cannot run PHP. Keep the design visible and provide usable contact links.
path = out / 'contact.html'
html = path.read_text()
start = '<form id="quoteForm" class="mt-8" action="get-quote.php" method="POST" novalidate>'
replacement = '''<div class="mt-8 rounded-2xl border border-brand-100 bg-brand-50 p-4" role="note">
    <p>This preview does not send estimate requests. Please <a class="font-semibold underline" href="tel:+19103303783">call (910) 330-3783</a> or <a class="font-semibold underline" href="mailto:dominguezlandscaping9@gmail.com">email us</a> for your free estimate.</p>
</div>
<form id="quoteForm" class="mt-8" novalidate data-preview="true">'''
assert start in html
html = html.replace(start, replacement)
html = html.replace('type="submit" id="quoteFormSubmit"', 'type="button" disabled id="quoteFormSubmit"')
html = html.replace('id="quoteFormSubmitText">Send My Request', 'id="quoteFormSubmitText">Preview only')
path.write_text(html)
(out / '.nojekyll').touch()
print(f'Built Pages preview: {base}/')
