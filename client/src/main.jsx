import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/atoms/ErrorBoundary.jsx'

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  if (import.meta.env.DEV) {
    console.warn('Unhandled promise rejection:', event.reason);
  }
});

// Register Service Worker for PWA (only in production)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    if (import.meta.env.DEV) {
      // Unregister any existing service worker in development to avoid caching/HMR issues
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (let registration of registrations) {
          registration.unregister();
        }
      });
    } else {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <HashRouter>
        <App />
      </HashRouter>
    </ErrorBoundary>
  </StrictMode>,
)
