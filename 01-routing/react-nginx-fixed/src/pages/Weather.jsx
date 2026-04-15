import { useEffect, useState } from 'react'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
const API_KEY = import.meta.env.VITE_API_KEY || 'demo-secret-key'

export default function Weather() {
  const [data, setData] = useState(null)
  const [err, setErr] = useState(null)

  useEffect(() => {
    fetch(API_BASE + '/api/weather?city=seoul', {
      headers: { 'X-API-Key': API_KEY }
    })
      .then((r) => r.json())
      .then(setData)
      .catch((e) => setErr(String(e)))
  }, [])

  if (err) return <p>error: {err}</p>
  if (!data) return <p>loading...</p>

  return (
    <div>
      <h1>Weather (seoul)</h1>
      <p>
        temp: {data.temp}, condition: {data.condition}
      </p>
    </div>
  )
}
