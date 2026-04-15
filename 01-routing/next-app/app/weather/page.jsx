const API_BASE = process.env.API_BASE || 'http://backend:8080'
const API_KEY = process.env.API_KEY || 'demo-secret-key'

export default async function WeatherPage() {
  // 서버에서 직접 호출 → API Key는 서버 환경에만 존재, 클라 번들에 포함되지 않음
  const res = await fetch(`${API_BASE}/api/weather?city=seoul`, {
    headers: { 'X-API-Key': API_KEY },
    cache: 'no-store'
  })
  if (!res.ok) {
    return <p>failed to load weather: {res.status}</p>
  }
  const data = await res.json()

  return (
    <div>
      <h1>Weather (seoul)</h1>
      <p>
        temp: {data.temp}, condition: {data.condition}
      </p>
    </div>
  )
}
