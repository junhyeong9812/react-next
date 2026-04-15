import express, { Request, Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// @ts-ignore - built by vite ssr
import { render } from '../server-bundle/entry-server.js';

type Post = {
  id: number;
  title: string;
  body: string;
  author: string;
  updatedAt: string;
};
type InitialData =
  | { kind: 'posts'; posts: Post[] }
  | { kind: 'post'; post: Post | null }
  | { kind: 'home' };

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CLIENT_DIR = path.join(ROOT, 'client');
const API_BASE = process.env.API_BASE ?? 'http://backend:8080';
const PORT = Number(process.env.PORT ?? 3000);

const template = fs.readFileSync(path.join(CLIENT_DIR, 'index.html'), 'utf-8');

const app = express();

// Serve built client assets (everything except index.html).
app.use(
  express.static(CLIENT_DIR, { index: false, extensions: ['js', 'css'] })
);

// Proxy API requests to backend so client-side fetches also work.
app.get('/api/posts', async (_req, res) => {
  try {
    const r = await fetch(`${API_BASE}/api/posts`);
    res.status(r.status).json(await r.json());
  } catch (e) {
    res.status(502).json({ error: 'upstream' });
  }
});
app.get('/api/posts/:id', async (req, res) => {
  try {
    const r = await fetch(`${API_BASE}/api/posts/${req.params.id}`);
    if (!r.ok) return res.status(r.status).json({ error: 'not found' });
    res.json(await r.json());
  } catch (e) {
    res.status(502).json({ error: 'upstream' });
  }
});

async function loadInitialData(url: string): Promise<InitialData> {
  try {
    if (url === '/posts' || url.startsWith('/posts?')) {
      const r = await fetch(`${API_BASE}/api/posts`);
      const posts = (await r.json()) as Post[];
      return { kind: 'posts', posts };
    }
    const m = url.match(/^\/posts\/([^/?#]+)/);
    if (m) {
      const r = await fetch(`${API_BASE}/api/posts/${m[1]}`);
      const post = r.ok ? ((await r.json()) as Post) : null;
      return { kind: 'post', post };
    }
  } catch {
    // fall through to home
  }
  return { kind: 'home' };
}

app.get('*', async (req: Request, res: Response) => {
  try {
    const initialData = await loadInitialData(req.url);
    const [htmlHead, htmlTail] = template.split('<!--ssr-outlet-->');

    let didError = false;
    const stream = render(req.url, initialData, {
      onShellReady() {
        res.status(didError ? 500 : 200);
        res.setHeader('Content-Type', 'text/html');
        res.write(htmlHead);
        stream.pipe(res, { end: false });
      },
      onShellError(err: unknown) {
        console.error('shell error', err);
        res.status(500).setHeader('Content-Type', 'text/html').end('<!doctype html><p>shell error</p>');
      },
      onAllReady() {
        const inject = `<script>window.__INITIAL_DATA__=${JSON.stringify(
          initialData
        ).replace(/</g, '\\u003c')}</script>`;
        res.write(inject);
        res.end(htmlTail);
      },
      onError(err: unknown) {
        didError = true;
        console.error(err);
      },
    });

    setTimeout(() => stream.abort(), 10_000);
  } catch (e) {
    console.error(e);
    res.status(500).end('error');
  }
});

app.listen(PORT, () => {
  console.log(`[react ssr] listening on ${PORT}, API_BASE=${API_BASE}`);
});
