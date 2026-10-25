/*
 * Crawlers that share a link do not run the script, so they would read the
 * home page's title on /resume and /projects. These two files are the same
 * app with that page's own title, description, and structured data.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { staticHead } from '../src/lib/seo.js';

const dist = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'dist');
const html = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

function esc(value) {
  return String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function apply(page) {
  const head = staticHead(page);
  let out = html;
  const set = (re, value) => {
    const next = out.replace(re, `$1${esc(value)}$2`);
    if (next === out) throw new Error(`head tag missing for ${page}: ${re}`);
    out = next;
  };
  out = out.replace(/<title>[^<]*<\/title>/, `<title>${esc(head.title)}</title>`);
  set(/(<meta name="description" content=")[^"]*(")/, head.description);
  set(/(<link rel="canonical" href=")[^"]*(")/, head.url);
  set(/(<meta property="og:title" content=")[^"]*(")/, head.title);
  set(/(<meta property="og:description" content=")[^"]*(")/, head.description);
  set(/(<meta property="og:url" content=")[^"]*(")/, head.url);
  set(/(<meta name="twitter:title" content=")[^"]*(")/, head.title);
  set(/(<meta name="twitter:description" content=")[^"]*(")/, head.description);
  set(/(<meta name="twitter:url" content=")[^"]*(")/, head.url);
  const json = JSON.stringify(head.jsonLd, null, 2).replace(/</g, '\\u003c');
  const next = out.replace(
    /<script id="site-jsonld" type="application\/ld\+json">[\s\S]*?<\/script>/,
    `<script id="site-jsonld" type="application/ld+json">\n  ${json.split('\n').join('\n  ')}\n  </script>`,
  );
  if (next === out) throw new Error(`structured data missing for ${page}`);
  return next;
}

for (const page of ['resume', 'projects']) {
  fs.writeFileSync(path.join(dist, `${page}.html`), apply(page));
}
