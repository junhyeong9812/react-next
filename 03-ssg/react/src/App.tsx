import { Routes, Route, Link } from 'react-router-dom';
import type { InitialData } from './types';
import Posts from './pages/Posts';
import PostDetail from './pages/PostDetail';

export default function App({ initialData }: { initialData: InitialData }) {
  return (
    <div>
      <header>
        <Link to="/">Home</Link> | <Link to="/posts">Posts</Link>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<h1>03-ssg/react</h1>} />
          <Route
            path="/posts"
            element={
              <Posts
                initialPosts={
                  initialData.kind === 'posts' ? initialData.posts : null
                }
              />
            }
          />
          <Route
            path="/posts/:id"
            element={
              <PostDetail
                initialPost={
                  initialData.kind === 'post' ? initialData.post : null
                }
              />
            }
          />
        </Routes>
      </main>
    </div>
  );
}
