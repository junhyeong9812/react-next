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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CLIENT_DIR = path.join(ROOT, 'client');
const API_BASE = process.env.API_BASE ?? 'http://backend:8080';
const PORT = Number(process.env.PORT ?? 3000);

const template = fs.readFileSync(path.join(CLIENT_DIR, 'index.html'), 'utf-8');

// Resolve the hashed bootstrap script path from Vite's ssr manifest / asset dir.
function findBootstrapScript(): string {
  const assetsDir = path.join(CLIENT_DIR, 'assets');
  if (!fs.existsSync(assetsDir)) return '/src/entry-client.tsx';
  const file = fs
    .readdirSync(assetsDir)
    .find((f) => f.startsWith('entry-client') && f.endsWith('.js'));
  return file ? `/assets/${file}` : '/src/entry-client.tsx';
}
const BOOTSTRAP = findBootstrapScript();

const app = express();
app.use(express.static(CLIENT_DIR, { index: false, extensions: ['js', 'css'] }));

function fetchSlowPosts(): Promise<Post[]> {
  return fetch(`${API_BASE}/api/posts/slow`).then((r) => r.json() as Promise<Post[]>);
}

app.get('*', async (req: Request, res: Response) => {
  try {
    const isSlow = req.url.startsWith('/posts-slow');
    const postsPromise = isSlow ? fetchSlowPosts() : null;

    // Capture the resolved value so we can inject __INITIAL_POSTS__ for hydration.
    let resolvedPosts: Post[] | null = null;
    const trackedPromise = postsPromise
      ? postsPromise.then((p) => {
          resolvedPosts = p;
          return p;
        })
      : null;

    const [htmlHead, htmlTail] = template.split('<!--ssr-outlet-->');
    const headWithoutBootstrap = htmlHead.replace(
      /<script type="module" src="\/src\/entry-client\.tsx"><\/script>/,
      ''
    );
    const tailWithoutBootstrap = htmlTail.replace(
      /<script type="module" src="\/src\/entry-client\.tsx"><\/script>/,
      ''
    );

    let didError = false;
    const stream = render(req.url, trackedPromise, {
      bootstrapScripts: [BOOTSTRAP],
      onShellReady() {
        res.status(didError ? 500 : 200);
        res.setHeader('Content-Type', 'text/html');
        res.setHeader('Transfer-Encoding', 'chunked');
        res.write(headWithoutBootstrap);
        stream.pipe(res, { end: false });
      },
      onShellError(err: unknown) {
        console.error('shell error', err);
        res
          .status(500)
          .setHeader('Content-Type', 'text/html')
          .end('<!doctype html><p>shell error</p>');
      },
      onAllReady() {
        if (resolvedPosts) {
          const inject = `<script>window.__INITIAL_POSTS__=${JSON.stringify(
            resolvedPosts
          ).replace(/</g, '\\u003c')}</script>`;
          res.write(inject);
        }
        res.end(tailWithoutBootstrap);
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
  console.log(`[react streaming] listening on ${PORT}, API_BASE=${API_BASE}`);
});
