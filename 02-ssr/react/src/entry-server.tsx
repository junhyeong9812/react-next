import { renderToPipeableStream } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom/server';
import App from './App';
import type { InitialData } from './types';

export function render(
  url: string,
  initialData: InitialData,
  options: {
    onShellReady?: () => void;
    onShellError?: (err: unknown) => void;
    onAllReady?: () => void;
    onError?: (err: unknown) => void;
  }
) {
  return renderToPipeableStream(
    <StaticRouter location={url}>
      <App initialData={initialData} />
    </StaticRouter>,
    options
  );
}
