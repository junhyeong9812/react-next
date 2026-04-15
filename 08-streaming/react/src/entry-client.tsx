import { hydrateRoot } from 'react-dom/client';
import App from './App';
import type { Post } from './types';

const initialPosts: Post[] | undefined = window.__INITIAL_POSTS__;
const postsPromise = initialPosts ? Promise.resolve(initialPosts) : null;

hydrateRoot(
  document.getElementById('root')!,
  <App url={window.location.pathname} postsPromise={postsPromise} />
);
