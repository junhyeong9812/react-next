import { revalidateTag } from 'next/cache';

// 'posts' 태그가 붙은 모든 fetch 캐시를 무효화.
export async function GET() {
  revalidateTag('posts');
  return Response.json({ ok: true, revalidated: 'posts', at: Date.now() });
}
