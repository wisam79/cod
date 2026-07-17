import React from 'react';
import PropTypes from 'prop-types';

async function forceAppRefresh() {
  try {
    // 1. Unregister all service workers
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        await registration.unregister();
      }
    }
    // 2. Clear all caches
    if ('caches' in window) {
      const keys = await caches.keys();
      for (const key of keys) {
        await caches.delete(key);
      }
    }
  } catch (err) {
    console.error("Failed to clear caches/SW:", err);
  } finally {
    // 3. Reload the page from the server
    window.location.reload(true);
  }
}

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static propTypes = {
    children: PropTypes.node.isRequired
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    // Check if it's a chunk loading failure (standard Vite chunk caching issue)
    const isChunkError = 
      /Failed to fetch dynamically imported module/i.test(error.message) ||
      /Loading chunk \d+ failed/i.test(error.message) ||
      /error loading dynamically imported module/i.test(error.message);
      
    if (isChunkError) {
      console.warn("Chunk load error detected, forcing app reload and cache purge to retrieve latest assets...");
      const reloadKey = 'chunk-error-reload-timestamp';
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();
      
      // Limit automatic reload to once every 10 seconds to prevent infinite reload loops
      if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
        sessionStorage.setItem(reloadKey, now.toString());
        forceAppRefresh();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: 'var(--bg-app)',
          color: 'var(--text-main)',
          padding: '24px',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            marginBottom: '16px',
            color: '#ef4444'
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <h2 style={{ marginBottom: '12px', fontWeight: '800' }}>حدث خطأ غير متوقع</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px', fontSize: '0.95rem' }}>
            نعتذر عن ذلك! تعطل التطبيق بسبب خطأ داخلي.
          </p>
          <button 
            onClick={forceAppRefresh}
            style={{
              padding: '12px 24px',
              backgroundColor: '#ff5500',
              color: '#fff',
              border: 'none',
              borderRadius: '25px',
              fontWeight: 'bold',
              cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(255, 85, 0, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
            إعادة تحميل التطبيق
          </button>
          {this.state.error && import.meta.env.DEV && (
            <pre style={{
              marginTop: '24px',
              padding: '12px',
              backgroundColor: 'var(--danger-light, #ffebe6)',
              color: 'var(--danger, #ff3300)',
              borderRadius: '12px',
              fontSize: '0.8rem',
              textAlign: 'left',
              width: '100%',
              maxWidth: '380px',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap'
            }}>
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
