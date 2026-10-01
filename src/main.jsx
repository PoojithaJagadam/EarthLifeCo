import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Prevent benign ResizeObserver loop notices
if (typeof window !== 'undefined') {
  const isBenignThirdPartyError = (msg) => {
    if (!msg) return false;
    const str = typeof msg === 'string' ? msg : (msg.message || String(msg));
    return (
      str.includes('ResizeObserver loop completed with undelivered notifications') ||
      str.includes('ResizeObserver loop limit exceeded')
    );
  };

  const originalOnError = window.onerror;
  window.onerror = function(message, source, lineno, colno, error) {
    if (isBenignThirdPartyError(message) || isBenignThirdPartyError(error?.message)) {
      return true;
    }
    if (originalOnError) {
      return originalOnError.apply(this, arguments);
    }
    return false;
  };

  window.addEventListener('unhandledrejection', function(event) {
    if (event && (isBenignThirdPartyError(event.reason?.message) || isBenignThirdPartyError(event.reason))) {
      event.stopImmediatePropagation();
      event.stopPropagation();
      event.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
