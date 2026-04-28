/**
 * Application Entry Point
 *
 * Mounts the root React component into the DOM.
 * Uses React.StrictMode for development-time checks (double rendering,
 * deprecated API warnings, effect cleanup validation).
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
