/**
 * Ecwid Live Commerce Cart Service
 *
 * Source of truth for cart operations interfacing with:
 * 1. Ecwid Storefront JS API (window.Ecwid.Cart) for browser session management
 * 2. Ecwid REST API (/order/calculate via /api/ecwid/cart/calculate proxy) for authoritative totals, taxes & shipping
 */

const STORAGE_KEY = 'earthlife_ecwid_cart_session_v2';
const ECWID_STORE_ID = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_ECWID_STORE_ID) || '141633269';

let ecwidScriptLoading = false;
let ecwidScriptLoaded = false;
const listeners = new Set();

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
      console.warn('Failed to load Ecwid storefront script, using REST calculate fallback.');
      resolve(null);
    };

    document.head.appendChild(script);
  });
}

/**
 * Load saved cart items session
 */
export function getSavedCartItems() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw || raw === 'undefined' || raw === 'null') return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Persist cart items session
 */
export function saveCartItems(items) {
  if (typeof window === 'undefined') return;
  try {
    if (Array.isArray(items)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  } catch (e) {
    console.error('Failed to persist cart items session:', e);
  }
}

/**
 * Create a deterministic unique key for a product and its options
 */
export function getCartItemKey(productId, options = {}) {
  const sortedOptions = Object.keys(options || {})
    .sort()
    .reduce((acc, key) => {
      acc[key] = options[key];
      return acc;
    }, {});
  return `${productId}__${JSON.stringify(sortedOptions)}`;
}

/**
 * Call Ecwid live calculate API to calculate authoritative order totals
 */
export async function calculateEcwidOrder(items, couponCode = null, shippingAddress = null, customer = null) {
  if (!Array.isArray(items) || items.length === 0) {
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

  try {
    const payload = {
      items: items.map((item) => ({
        productId: Number(item.productId || item.id),
        name: item.name || '',
        price: Number(item.price || 0),
        quantity: Math.max(1, Number(item.quantity || 1)),
        sku: item.sku || '',
        options: item.options || {}
      })),
      couponCode: couponCode ? String(couponCode).trim() : undefined
    };

    if (shippingAddress) {
      payload.shippingAddress = shippingAddress;
    }
    if (customer) {
      payload.customer = customer;
    }

    const response = await fetch('/api/ecwid/cart/calculate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response && response.ok) {
      let data = null;
      try {
        const text = await response.text();
        if (text && text.trim() && text.trim() !== 'undefined') {
          data = JSON.parse(text);
        }
      } catch (parseErr) {
        console.warn('Failed to parse Ecwid calculate response:', parseErr);
      }

      if (data) {
        return {
          subtotal: typeof data.subtotal === 'number' ? data.subtotal : (data.subtotal ?? 0),
          subtotalWithoutTax: typeof data.subtotalWithoutTax === 'number' ? data.subtotalWithoutTax : (data.subtotalWithoutTax ?? 0),
          total: typeof data.total === 'number' ? data.total : (data.total ?? 0),
          totalWithoutTax: typeof data.totalWithoutTax === 'number' ? data.totalWithoutTax : (data.totalWithoutTax ?? 0),
          tax: typeof data.tax === 'number' ? data.tax : (data.tax ?? 0),
          taxes: Array.isArray(data.taxes) ? data.taxes : [],
          shipping: typeof data.shipping === 'number' ? data.shipping : (data.shipping ?? 0),
          discount: typeof data.discount === 'number' ? data.discount : (data.discount ?? 0),
          couponDiscount: typeof data.couponDiscount === 'number' ? data.couponDiscount : (data.couponDiscount ?? 0),
          volumeDiscount: typeof data.volumeDiscount === 'number' ? data.volumeDiscount : (data.volumeDiscount ?? 0),
          couponError: data.couponError || null,
          items: Array.isArray(data.items) ? data.items : []
        };
      }
    }
  } catch (err) {
    console.error('Error calculating Ecwid order totals:', err);
  }

  // Graceful deterministic fallback if calculate proxy is temporarily unreachable
  const subtotal = items.reduce((acc, item) => acc + (Number(item.price || 0) * Math.max(1, Number(item.quantity || 1))), 0);
  return {
    subtotal,
    total: subtotal,
    tax: 0,
    taxes: [],
    shipping: 0,
    discount: 0,
    couponDiscount: 0,
    volumeDiscount: 0,
    items: []
  };
}

/**
 * Add a product to the Ecwid Cart
 */
export async function addProductToEcwidCart(product, quantity = 1, options = {}) {
  await ensureEcwidLoaded();

  // 1. Sync with window.Ecwid.Cart if available
  const rawId = product.ecwidId || product.productId || product.id;
  const numericId = Number(rawId);
  if (!isNaN(numericId) && typeof window !== 'undefined' && window.Ecwid && window.Ecwid.Cart && typeof window.Ecwid.Cart.addProduct === 'function') {
    try {
      const ecwidProductPayload = {
        id: numericId,
        quantity: Math.max(1, Number(quantity)),
        options: options && Object.keys(options).length > 0 ? options : undefined
      };
      window.Ecwid.Cart.addProduct(ecwidProductPayload, (success) => {
        if (!success) {
          console.warn('Ecwid.Cart.addProduct returned false or error');
        }
      });
    } catch (e) {
      console.warn('Ecwid.Cart.addProduct invocation error:', e);
    }
  }

  // 2. Manage unified authoritative cart state
  const currentItems = getSavedCartItems();
  const itemKey = getCartItemKey(product.id, options);
  const existingIndex = currentItems.findIndex((it) => it.itemKey === itemKey);

  let updatedItems;
  if (existingIndex >= 0) {
    updatedItems = currentItems.map((it, idx) =>
      idx === existingIndex
        ? { ...it, quantity: it.quantity + Math.max(1, Number(quantity)) }
        : it
    );
  } else {
    const newItem = {
      itemKey,
      productId: !isNaN(numericId) ? numericId : product.id,
      ecwidId: !isNaN(numericId) ? String(numericId) : product.ecwidId,
      id: product.id,
      name: product.name,
      price: Number(product.price || 0),
      originalPrice: Number(product.originalPrice || product.compareToPrice || product.price || 0),
      image: product.image || (product.gallery && product.gallery[0]) || '',
      category: product.categoryType || product.categoryName || 'Natural Essentials',
      sku: product.sku || '',
      quantity: Math.max(1, Number(quantity)),
      options: options || {}
    };
    updatedItems = [...currentItems, newItem];
  }

  saveCartItems(updatedItems);
  return updatedItems;
}

/**
 * Remove an item from the Ecwid Cart
 */
export async function removeProductFromEcwidCart(itemKey) {
  await ensureEcwidLoaded();

  const currentItems = getSavedCartItems();
  const targetIndex = currentItems.findIndex((it) => it.itemKey === itemKey);

  // Sync with window.Ecwid.Cart if available
  if (targetIndex >= 0 && typeof window !== 'undefined' && window.Ecwid && window.Ecwid.Cart && typeof window.Ecwid.Cart.removeProduct === 'function') {
    try {
      window.Ecwid.Cart.removeProduct(targetIndex, () => {});
    } catch (e) {
      console.warn('Ecwid.Cart.removeProduct invocation error:', e);
    }
  }

  const updatedItems = currentItems.filter((it) => it.itemKey !== itemKey);
  saveCartItems(updatedItems);
  return updatedItems;
}

/**
 * Update quantity of a product in the Ecwid Cart
 */
export async function updateProductQuantityInEcwidCart(itemKey, newQuantity) {
  const qty = Number(newQuantity);
  if (qty <= 0) {
    return removeProductFromEcwidCart(itemKey);
  }

  await ensureEcwidLoaded();

  const currentItems = getSavedCartItems();
  const updatedItems = currentItems.map((it) =>
    it.itemKey === itemKey ? { ...it, quantity: qty } : it
  );

  saveCartItems(updatedItems);

  // Sync with Ecwid Storefront cart if available
  if (typeof window !== 'undefined' && window.Ecwid && window.Ecwid.Cart) {
    try {
      // Ecwid does not have setProductQuantity; clearing and re-adding ensures full sync
      // or we can refresh Ecwid cart
      if (typeof window.Ecwid.Cart.clear === 'function' && typeof window.Ecwid.Cart.addProduct === 'function') {
        window.Ecwid.Cart.clear(() => {
          updatedItems.forEach((it) => {
            window.Ecwid.Cart.addProduct({
              id: Number(it.productId),
              quantity: it.quantity,
              options: it.options && Object.keys(it.options).length > 0 ? it.options : undefined
            });
          });
        });
      }
    } catch (e) {
      console.warn('Ecwid.Cart quantity sync error:', e);
    }
  }

  return updatedItems;
}

/**
 * Clear all products from the Ecwid Cart
 */
export async function clearEcwidCart() {
  await ensureEcwidLoaded();

  if (typeof window !== 'undefined' && window.Ecwid && window.Ecwid.Cart && typeof window.Ecwid.Cart.clear === 'function') {
    try {
      window.Ecwid.Cart.clear(() => {});
    } catch (e) {
      console.warn('Ecwid.Cart.clear error:', e);
    }
  }

  saveCartItems([]);
  return [];
}

/**
 * Synchronize all current items directly to the Ecwid Storefront Cart session
 * Safe non-destructive sync that checks cart contents before adding, avoiding
 * ClearCheckoutMutation race conditions during checkout.
 */
export async function syncCartToEcwidStorefront(items) {
  if (typeof window === 'undefined') return;

  return new Promise((resolve) => {
    // Safety timeout: Never let storefront sync block the checkout flow for more than 600ms
    const safetyTimer = setTimeout(() => {
      resolve();
    }, 600);

    const safeDone = () => {
      clearTimeout(safetyTimer);
      resolve();
    };

    try {
      if (!window.Ecwid || !window.Ecwid.Cart) {
        safeDone();
        return;
      }

      // Check current Ecwid Cart state before modifying anything
      if (typeof window.Ecwid.Cart.get === 'function') {
        window.Ecwid.Cart.get((currentCart) => {
          try {
            const existingProducts = currentCart?.products || [];

            // If Ecwid cart already has items, do NOT call Cart.clear() as it destroys
            // active checkout transactions and triggers Relay ClearCheckoutMutation crashes
            if (existingProducts.length > 0) {
              safeDone();
              return;
            }

            // If Ecwid cart is empty and we have local items, add them safely
            if (!items || items.length === 0) {
              safeDone();
              return;
            }

            let remaining = items.length;
            const onDone = () => {
              remaining--;
              if (remaining <= 0) safeDone();
            };

            items.forEach((it) => {
              try {
                const numericId = Number(it.ecwidId || it.productId || it.id);
                if (isNaN(numericId)) {
                  onDone();
                  return;
                }
                window.Ecwid.Cart.addProduct({
                  id: numericId,
                  quantity: Math.max(1, Number(it.quantity || 1)),
                  options: it.options && Object.keys(it.options).length > 0 ? it.options : undefined
                }, () => onDone());
              } catch (addErr) {
                console.warn('Ecwid Cart.addProduct error during sync:', addErr);
                onDone();
              }
            });
          } catch (getErr) {
            console.warn('Error reading Ecwid cart during sync:', getErr);
            safeDone();
          }
        });
      } else {
        safeDone();
      }
    } catch (e) {
      console.warn('Failed to sync items to Ecwid storefront cart:', e);
      safeDone();
    }
  });
}
