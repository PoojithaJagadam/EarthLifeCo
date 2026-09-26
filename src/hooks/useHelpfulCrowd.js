/**
 * useHelpfulCrowd hook
 * Integrates HelpfulCrowd storefront runtime & widgets for store Q0SJgz7
 */
import { useEffect } from 'react';

const STORE_HASH = 'Q0SJgz7';
let runtimePromise = null;

export function ensureHelpfulCrowdRuntime() {
  if (typeof window === 'undefined') return Promise.resolve(null);
  if (runtimePromise) return runtimePromise;

  runtimePromise = (async () => {
    try {
      // 1. Ensure jQuery is available as required by HelpfulCrowd widgets
      if (!window.jQuery) {
        await new Promise((res) => {
          const jqScript = document.createElement('script');
          jqScript.src = 'https://code.jquery.com/jquery-3.7.1.min.js';
          jqScript.async = true;
          jqScript.onload = () => res();
          jqScript.onerror = () => res();
          document.head.appendChild(jqScript);
        });
      }

      // 2. Define cache helper if not present
      if (!window.hc_get_script_cached && window.jQuery) {
        window.hc_get_script_cached = function(url, callback) {
          return window.jQuery.ajax({
            dataType: 'script',
            cache: true,
            url: url,
            success: callback
          });
        };
      }

      // 3. Fetch manifest for Q0SJgz7
      const manifestRes = await fetch(`https://app.helpfulcrowd.com/res/widgets/${STORE_HASH}.json`);
      if (!manifestRes.ok) {
        return null;
      }

      const manifest = await manifestRes.json();

      // 4. Inject theme CSS
      if (manifest.css?.url && !document.querySelector(`link[href="${manifest.css.url}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = manifest.css.url;
        document.head.appendChild(link);
      }

      // 5. Inject settings CSS
      if (manifest.settings_css?.code && !document.getElementById('hc-settings-css')) {
        try {
          const style = document.createElement('style');
          style.id = 'hc-settings-css';
          style.textContent = atob(manifest.settings_css.code);
          document.head.appendChild(style);
        } catch (e) {
          console.warn('Failed to parse HelpfulCrowd settings CSS:', e);
        }
      }

      // 6. Inject custom CSS if enabled
      if (manifest.custom_css?.enabled && manifest.custom_css?.code && !document.getElementById('hc-custom-css')) {
        try {
          const style = document.createElement('style');
          style.id = 'hc-custom-css';
          style.textContent = atob(manifest.custom_css.code);
          document.head.appendChild(style);
        } catch (e) {
          console.warn('Failed to parse HelpfulCrowd custom CSS:', e);
        }
      }

      // 7. Load front.js bundle
      if (manifest.js?.url) {
        if (!document.querySelector(`script[src="${manifest.js.url}"]`)) {
          return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = manifest.js.url;
            script.async = true;
            script.onload = () => resolve({ manifest, ready: true });
            script.onerror = () => resolve({ manifest, ready: false });
            document.head.appendChild(script);
          });
        }
        return { manifest, ready: true };
      }

      return { manifest, ready: true };
    } catch (err) {
      console.warn('HelpfulCrowd runtime initialization error:', err);
      return null;
    }
  })();

  return runtimePromise;
}

export function refreshHelpfulCrowdWidget(widgetType, productId) {
  if (typeof window === 'undefined') return;

  ensureHelpfulCrowdRuntime().then((rt) => {
    try {
      const theme = rt?.manifest?.css?.theme || 'hc-theme__light hc-theme__border_style-rounded hc-theme__shadow_style-shadow';
      const cleanType = widgetType ? widgetType.replace(/-/g, '_') : 'review_slider';

      if (typeof window.hc_process_static_page === 'function') {
        window.hc_process_static_page(STORE_HASH, theme, cleanType, productId);
      } else {
        const event = new Event('helpfulcrowd:refresh');
        document.dispatchEvent(event);
        window.dispatchEvent(event);
      }
    } catch (e) {
      console.warn('HelpfulCrowd process error:', e);
    }
  });
}

const useHelpfulCrowd = (widgetType, productId) => {
  useEffect(() => {
    refreshHelpfulCrowdWidget(widgetType, productId);
  }, [widgetType, productId]);
};

export default useHelpfulCrowd;
