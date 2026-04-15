import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Home from './pages/Home.jsx';
import PostDetail from './pages/PostDetail.jsx';

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <nav style={{ padding: 12, borderBottom: '1px solid #ddd' }}>
          <Link to="/" style={{ marginRight: 12 }}>Home</Link>
          <Link to="/posts/1" style={{ marginRight: 12 }}>Post 1</Link>
          <Link to="/posts/2">Post 2</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/posts/:id" element={<PostDetail />} />
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
