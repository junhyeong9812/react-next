import { renderToPipeableStream } from 'react-dom/server';
import App from './App';
import type { Post } from './types';

export function render(
  url: string,
  postsPromise: Promise<Post[]> | null,
  options: {
    bootstrapScripts?: string[];
    onShellReady?: () => void;
    onShellError?: (err: unknown) => void;
    onAllReady?: () => void;
    onError?: (err: unknown) => void;
  }
) {
  return renderToPipeableStream(
    <App url={url} postsPromise={postsPromise} />,
    options
  );
}
