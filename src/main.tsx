import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Catch and prevent cross-origin third-party script errors (e.g., Disqus, adblockers) from causing uncaught app errors
window.addEventListener('error', (event) => {
  if (
    event.message === 'Script error.' ||
    (typeof event.message === 'string' && event.message.includes('Disqus')) ||
    (event.filename && event.filename.includes('disqus'))
  ) {
    event.preventDefault();
    console.warn('Suppressed third-party cross-origin script error:', event.message);
    return true;
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

