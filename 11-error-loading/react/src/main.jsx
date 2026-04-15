import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary.jsx';
import Loading from './Loading.jsx';
import Posts from './pages/Posts.jsx';
import PostDetail from './pages/PostDetail.jsx';
import Home from './pages/Home.jsx';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: 12, borderBottom: '1px solid #ddd' }}>
        <Link to="/" style={{ marginRight: 12 }}>Home</Link>
        <Link to="/posts" style={{ marginRight: 12 }}>Posts</Link>
        <Link to="/posts/1" style={{ marginRight: 12 }}>Post 1</Link>
        <Link to="/posts/999">Post 999 (404)</Link>
      </nav>
      {/* 수동 경계 배치: 개발자가 어디에 둘지 결정 */}
      <ErrorBoundary>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/posts/:id" element={<PostDetail />} />
          </Routes>
        </Suspense>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
