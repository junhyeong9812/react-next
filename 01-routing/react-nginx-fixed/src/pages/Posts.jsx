import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'

export default function Posts() {
  const [posts, setPosts] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    fetch(API_BASE + '/api/posts')
      .then((r) => r.json())
      .then(setPosts)
      .catch((e) => setErr(String(e)))
  }, [])

  if (err) return <p>error: {err}</p>
  if (!posts) return <p>loading...</p>

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
