const API_BASE = process.env.API_BASE || 'http://backend:8080'

export default async function PostsPage() {
  const res = await fetch(`${API_BASE}/api/posts`, { cache: 'no-store' })
  if (!res.ok) {
    return <p>failed to load posts: {res.status}</p>
  }
  const posts = await res.json()

  return (
    <div>
      <h1>Posts</h1>
      <ul>
        {posts.map((p) => (
          <li key={p.id}>{p.title}</li>
        ))}
      </ul>
    </div>
  )
}
