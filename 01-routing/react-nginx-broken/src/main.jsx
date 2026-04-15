import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Posts from './pages/Posts.jsx'
import Weather from './pages/Weather.jsx'

function App() {
  return (
    <BrowserRouter>
      <nav style={{ display: 'flex', gap: 12, padding: 12, borderBottom: '1px solid #ddd' }}>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
        <Link to="/posts">Posts</Link>
        <Link to="/weather">Weather</Link>
      </nav>
      <main style={{ padding: 16 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/posts" element={<Posts />} />
          <Route path="/weather" element={<Weather />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />)
