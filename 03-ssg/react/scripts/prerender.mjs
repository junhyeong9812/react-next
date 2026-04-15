import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const distDir = resolve(root, 'dist');
const serverBundle = resolve(root, 'dist/server-bundle/entry-server.js');

const { render } = await import(serverBundle);

const template = readFileSync(resolve(distDir, 'index.html'), 'utf-8');

async function loadPosts() {
  const apiBase = process.env.API_BASE;
  if (apiBase) {
    try {
      const res = await fetch(`${apiBase}/api/posts`);
      if (res.ok) {
        console.log(`[prerender] fetched posts from ${apiBase}/api/posts`);
        return await res.json();
      }
      console.warn(`[prerender] fetch failed (${res.status}), falling back to local data`);
    } catch (err) {
      console.warn(`[prerender] fetch error: ${err.message}, falling back to local data`);
    }
  }
  const localPath = resolve(root, 'data/posts.json');
  console.log(`[prerender] loading posts from ${localPath}`);
  return JSON.parse(readFileSync(localPath, 'utf-8'));
}

function injectHtml(appHtml, initialData) {
  const dataScript = `<script>window.__INITIAL_DATA__=${JSON.stringify(
    initialData
  ).replace(/</g, '\\u003c')}</script>`;
  return template
    .replace('<!--ssr-outlet-->', appHtml)
    .replace('</body>', `${dataScript}</body>`);
}

function writeFile(relPath, html) {
  const outPath = resolve(distDir, relPath);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, html, 'utf-8');
  console.log(`[prerender] wrote ${relPath}`);
}

const posts = await loadPosts();

const postsInitial = { kind: 'posts', posts };
const listHtml = render('/posts', postsInitial);
writeFile('posts/index.html', injectHtml(listHtml, postsInitial));

for (const post of posts) {
  const initial = { kind: 'post', post };
  const appHtml = render(`/posts/${post.id}`, initial);
  writeFile(`posts/${post.id}/index.html`, injectHtml(appHtml, initial));
}

const homeInitial = { kind: 'home' };
const homeHtml = render('/', homeInitial);
writeFile('index.html', injectHtml(homeHtml, homeInitial));

console.log(`[prerender] done. ${posts.length} post pages + list + home`);
