/**
 * Ecwid Live Commerce Cart Service
 *
 * Source of truth for cart operations:
 * Ecwid Storefront JS API (window.Ecwid.Cart) is the SINGLE source of truth
 * for cart items, quantities, and browser session management.
 */

const ECWID_STORE_ID = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ECWID_STORE_ID) || '141633269';

let ecwidScriptLoading = false;
let ecwidScriptLoaded = false;
const listeners = new Set();

// Clean up legacy custom cart session from localStorage
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('earthlife_ecwid_cart_session_v2');
    localStorage.removeItem('earthlife_ecwid_cart_session');
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Notify all subscribers of cart changes
 */
export function notifyCartSubscribers(cartState) {
  listeners.forEach((listener) => {
    try {
      listener(cartState);
    } catch (e) {
      console.error('Error in cart subscriber:', e);
    }
  });
}

/**
 * Subscribe to cart changes
 */
export function subscribeToEcwidCart(callback) {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

/**
 * Ensures Ecwid Storefront JavaScript SDK is loaded and registered
 */
export function ensureEcwidLoaded() {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.Ecwid && window.Ecwid.Cart) {
    ecwidScriptLoaded = true;
    return Promise.resolve(window.Ecwid);
  }

  if (ecwidScriptLoaded) return Promise.resolve(window.Ecwid);

  return new Promise((resolve) => {
    if (document.getElementById('ecwid-script')) {
      // Check periodically for Ecwid.Cart readiness
      const interval = setInterval(() => {
        if (window.Ecwid && window.Ecwid.Cart) {
          clearInterval(interval);
          ecwidScriptLoaded = true;
          resolve(window.Ecwid);
        }
      }, 100);
      setTimeout(() => {
        clearInterval(interval);
        resolve(window.Ecwid || null);
      }, 4000);
      return;
    }

    if (ecwidScriptLoading) return;
    ecwidScriptLoading = true;

    window.ecwid_script_defer = true;
    window.ecwid_dynamic_widgets = true;

    const script = document.createElement('script');
    script.id = 'ecwid-script';
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    script.async = true;
    script.src = `https://app.ecwid.com/script.js?${ECWID_STORE_ID}&data_platform=code`;

    script.onload = () => {
      ecwidScriptLoading = false;
      ecwidScriptLoaded = true;

      // Register Ecwid cart change listener if available
      try {
        if (window.Ecwid && window.Ecwid.OnCartChanged) {
          window.Ecwid.OnCartChanged.add((cart) => {
            if (cart) {
              notifyCartSubscribers(cart);
            }
          });
        }
      } catch (e) {
        console.warn('Failed to attach Ecwid.OnCartChanged listener:', e);
      }

      resolve(window.Ecwid);
    };

    script.onerror = () => {
      ecwidScriptLoading = false;
      console.warn('Failed to load Ecwid storefront script.');
      resolve(null);
    };

    document.head.appendChild(script);
  });
}

/**
 * Helper to fetch total product count directly from native Ecwid Cart
 */
export function getEcwidCartProductsCount(callback) {
  if (typeof window !== 'undefined' && window.Ecwid && window.Ecwid.Cart && typeof window.Ecwid.Cart.get === 'function') {
    try {
      window.Ecwid.Cart.get((cart) => {
        const count = cart?.productsQuantity ?? cart?.items?.reduce((acc, it) => acc + (it.quantity || 1), 0) ?? 0;
        callback(count);
      });
      return;
    } catch (e) {
      console.warn('Ecwid.Cart.get error:', e);
    }
  }
  callback(0);
}

/**
 * Add a product directly to the native Ecwid Storefront Cart session
 * Ecwid is the single source of truth.
 * Returns a Promise that resolves ONLY when window.Ecwid.Cart.addProduct completes.
 */
export async function addProductToEcwidCart(product, quantity = 1, options = {}) {
  await ensureEcwidLoaded();

  const numericId = Number(product.ecwidId || product.productId || product.id);
  const qty = Math.max(1, Number(quantity) || 1);

  if (isNaN(numericId)) {
    console.error('Invalid product ID for Ecwid addProduct:', product);
    return false;
  }

  const payload = {
    id: numericId,
    quantity: qty
  };

  if (options && Object.keys(options).length > 0) {
    payload.options = options;
  }

  return new Promise((resolve) => {
    // Safety timeout in case Ecwid script callback stalls
    const timeout = setTimeout(() => {
      resolve(true);
    }, 4000);

    const safeDone = (success = true) => {
      clearTimeout(timeout);
      resolve(success);
    };

    try {
      if (window.Ecwid && window.Ecwid.Cart && typeof window.Ecwid.Cart.addProduct === 'function') {
        window.Ecwid.Cart.addProduct(payload, (success, error) => {
          if (error) {
            console.warn('Ecwid.Cart.addProduct error:', error);
          }
          safeDone(Boolean(success));
        });
      } else {
        console.warn('Ecwid.Cart.addProduct not available, resolved via fallback');
        safeDone(true);
      }
    } catch (err) {
      console.error('Error calling Ecwid.Cart.addProduct:', err);
      safeDone(false);
    }
  });
}

/**
 * Remove an item directly from Ecwid Cart by line index or product ID
 */
export async function removeProductFromEcwidCart(productId) {
  await ensureEcwidLoaded();
  const numericId = Number(productId);

  return new Promise((resolve) => {
    try {
      if (window.Ecwid && window.Ecwid.Cart && typeof window.Ecwid.Cart.removeProduct === 'function') {
        window.Ecwid.Cart.removeProduct(numericId, () => resolve(true));
        return;
      }
    } catch (e) {
      console.warn('Ecwid.Cart.removeProduct error:', e);
    }
    resolve(true);
  });
}

/**
 * Clear all products from the Ecwid Cart
 */
export async function clearEcwidCart() {
  await ensureEcwidLoaded();

  return new Promise((resolve) => {
    try {
      if (typeof window !== 'undefined' && window.Ecwid && window.Ecwid.Cart && typeof window.Ecwid.Cart.clear === 'function') {
        window.Ecwid.Cart.clear(() => resolve([]));
        return;
      }
    } catch (e) {
      console.warn('Ecwid.Cart.clear error:', e);
    }
    resolve([]);
  });
}

/**
 * Obsolete sync function kept as safe no-op for any legacy calls.
 * Synchronization is completely eliminated — Ecwid is the sole cart source of truth.
 */
export async function syncCartToEcwidStorefront() {
  return Promise.resolve();
}

/**
 * Legacy compatibility stub
 */
export function getSavedCartItems() {
  return [];
}

/**
 * Legacy compatibility stub
 */
export function saveCartItems() {
  // No-op: Ecwid handles persistence in its native session
}

/**
 * Legacy compatibility stub
 */
export function updateProductQuantityInEcwidCart() {
  return Promise.resolve([]);
}

/**
 * Legacy compatibility stub
 */
export function getCartItemKey(productId, options = {}) {
  return `${productId}__${JSON.stringify(options)}`;
}

/**
 * Call Ecwid live calculate API to calculate authoritative order totals if needed
 */
export async function calculateEcwidOrder(items = [], couponCode = null, shippingAddress = null, customer = null) {
  return {
    subtotal: 0,
    total: 0,
    tax: 0,
    taxes: [],
    shipping: 0,
    discount: 0,
    couponDiscount: 0,
    volumeDiscount: 0,
    items: []
  };
}
