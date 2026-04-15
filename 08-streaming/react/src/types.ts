export type Post = {
  id: number;
  title: string;
  body: string;
  author: string;
  updatedAt: string;
};

declare global {
  interface Window {
    __INITIAL_POSTS__?: Post[];
  }
}
