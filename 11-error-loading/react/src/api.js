const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080';

/**
 * Suspense-friendly resource cache.
 * - fetch가 pending이면 promise를 throw → Suspense fallback
 * - fetch가 error면 Error를 throw → ErrorBoundary catch
 * - 성공하면 data 반환
 */
const cache = new Map();

export function fetchResource(key, loader) {
  if (!cache.has(key)) {
    const entry = { status: 'pending', value: null };
    entry.promise = loader()
      .then((data) => {
        entry.status = 'success';
        entry.value = data;
      })
      .catch((err) => {
        entry.status = 'error';
        entry.value = err;
      });
    cache.set(key, entry);
  }
  const entry = cache.get(key);
  if (entry.status === 'pending') throw entry.promise;
  if (entry.status === 'error') throw entry.value;
  return entry.value;
}

export function invalidate(key) {
  cache.delete(key);
}

export async function loadPosts() {
  const res = await fetch(`${API_BASE}/api/posts`);
  if (!res.ok) {
    throw new Error(`GET /api/posts 실패: ${res.status}`);
  }
  return res.json();
}

export async function loadPost(id) {
  const res = await fetch(`${API_BASE}/api/posts/${id}`);
  if (!res.ok) {
    // 404 등 HTTP 에러 → 명시적으로 throw 하지 않으면 ErrorBoundary가 못 잡음
    throw new Error(`GET /api/posts/${id} 실패: ${res.status}`);
  }
  return res.json();
}
