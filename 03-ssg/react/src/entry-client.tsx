import { hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import type { InitialData } from './types';

const initialData: InitialData =
  window.__INITIAL_DATA__ ?? { kind: 'home' };

hydrateRoot(
  document.getElementById('root')!,
  <BrowserRouter>
    <App initialData={initialData} />
  </BrowserRouter>
);
