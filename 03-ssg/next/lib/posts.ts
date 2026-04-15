import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

export type Post = {
  id: number;
  title: string;
  body: string;
  author: string;
  updatedAt: string;
};

async function loadFromFile(): Promise<Post[]> {
  const p = resolve(process.cwd(), 'data/posts.json');
  const raw = await readFile(p, 'utf-8');
  return JSON.parse(raw);
}

export async function loadPosts(): Promise<Post[]> {
  const apiBase = process.env.API_BASE;
  if (apiBase) {
    try {
      const res = await fetch(`${apiBase}/api/posts`);
      if (res.ok) return (await res.json()) as Post[];
      console.warn(
        `[ssg-next] fetch ${apiBase}/api/posts failed ${res.status}, falling back to local file`
      );
    } catch (err) {
      console.warn(
        `[ssg-next] fetch ${apiBase}/api/posts error: ${(err as Error).message}, falling back to local file`
      );
    }
  }
  return loadFromFile();
}

export async function loadPost(id: string): Promise<Post | null> {
  const apiBase = process.env.API_BASE;
  if (apiBase) {
    try {
      const res = await fetch(`${apiBase}/api/posts/${id}`);
      if (res.ok) return (await res.json()) as Post;
      if (res.status === 404) return null;
    } catch {
      // fall through
    }
  }
  const posts = await loadFromFile();
  return posts.find((p) => String(p.id) === String(id)) ?? null;
}
