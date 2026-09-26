import React, { useEffect } from 'react';

/**
 * EcwidGlobalWidget — renders the single Ecwid storefront widget in the DOM
 * (hidden by default). This must exist globally so window.Ecwid.openPage()
 * works from any page (checkout, account, etc.) without re-mounting.
 *
 * It calls window.xProductBrowser once and listens to OnAPILoaded.
 * Other pages then call window.Ecwid.openPage(pageName) to navigate.
 */
const EcwidGlobalWidget = () => {
  const storeId = import.meta.env.VITE_ECWID_STORE_ID || '141633269';

  useEffect(() => {
    const divId = `my-store-${storeId}`;

    const initStore = () => {
      if (window.xProductBrowser && !window.__ecwidGlobalWidgetInitialized) {
        window.__ecwidGlobalWidgetInitialized = true;
        window.xProductBrowser('id=' + divId);
      }
    };

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
      script.onload = () => initStore();
    } else {
      initStore();
    }
  }, [storeId]);

  return (
    <div
      id={`my-store-${import.meta.env.VITE_ECWID_STORE_ID || '141633269'}`}
      style={{ display: 'none', position: 'absolute', pointerEvents: 'none', visibility: 'hidden' }}
      aria-hidden="true"
    />
  );
};

export default EcwidGlobalWidget;
