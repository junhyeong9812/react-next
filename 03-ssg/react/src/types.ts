export type Post = {
  id: number;
  title: string;
  body: string;
  author: string;
  updatedAt: string;
};

export type InitialData =
  | { kind: 'posts'; posts: Post[] }
  | { kind: 'post'; post: Post | null }
  | { kind: 'home' };

declare global {
  interface Window {
    __INITIAL_DATA__?: InitialData;
  }
}
