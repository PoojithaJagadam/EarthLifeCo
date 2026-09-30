import React, { useEffect, useRef } from 'react';

const EcwidStore = ({ defaultPage, className = '', placeholderText }) => {
  const storeId = import.meta.env.VITE_ECWID_STORE_ID || '141633269';
  const storeDiv = useRef(null);

  const defaultPlaceholder = defaultPage?.startsWith('checkout')
    ? 'Loading Ecwid Secure Checkout...'
    : 'Loading Ecwid Store...';
  const displayPlaceholder = placeholderText || defaultPlaceholder;

  useEffect(() => {
    let hasNavigated = false;

    const navigateToDefault = () => {
      if (hasNavigated) return;
      if (defaultPage && window.Ecwid && typeof window.Ecwid.openPage === 'function') {
        hasNavigated = true;
        try {
          window.Ecwid.openPage(defaultPage);
        } catch (e) {
          console.warn('Ecwid openPage error:', e);
        }
      }
    };

    const initStore = () => {
      if (window.xProductBrowser) {
        window.xProductBrowser("id=my-store-" + storeId);
      }

      if (window.Ecwid && typeof window.Ecwid.openPage === 'function') {
        navigateToDefault();
      } else if (window.Ecwid?.OnAPILoaded?.add) {
        window.Ecwid.OnAPILoaded.add(navigateToDefault);
      }
    };

    // Load Ecwid Script if not already loaded
    if (!document.getElementById('ecwid-script')) {
      window.ecwid_script_defer = true;
      window.ecwid_dynamic_widgets = true;

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.charset = 'utf-8';
      script.id = 'ecwid-script';
      script.async = true;
      script.src = `https://app.ecwid.com/script.js?${storeId}&data_platform=code&data_date=2024-01-01`;
      document.head.appendChild(script);
      
      script.onload = () => {
        initStore();
      };
    } else {
      initStore();
    }
  }, [storeId, defaultPage]);

  return (
    <div id={`my-store-${storeId}`} ref={storeDiv} className={`ecwid-store-container ${className}`}>
      <p style={{ textAlign: 'center', color: '#6B7280', padding: '2rem' }}>{displayPlaceholder}</p>
    </div>
  );
};

export default EcwidStore;
