import { Suspense } from 'react';
import Layout from './components/Layout';
import SkeletonList from './components/SkeletonList';
import PostsList from './components/PostsList';
import type { Post } from './types';

export default function App({
  url,
  postsPromise,
}: {
  url: string;
  postsPromise: Promise<Post[]> | null;
}) {
  if (url.startsWith('/posts-slow') && postsPromise) {
    return (
      <Layout>
        <h2>Posts (slow)</h2>
        <p>Shell rendered immediately. Body streams in when the 2s API resolves.</p>
        <Suspense fallback={<SkeletonList />}>
          <PostsList postsPromise={postsPromise} />
        </Suspense>
      </Layout>
    );
  }
  return (
    <Layout>
      <h2>Home</h2>
      <p>Go to <a href="/posts-slow">/posts-slow</a> to see streaming SSR.</p>
    </Layout>
  );
}
