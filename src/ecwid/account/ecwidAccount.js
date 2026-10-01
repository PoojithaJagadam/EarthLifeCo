/**
 * EarthLife Co. - Ecwid Customer Account Integration
 * Pure integration with Ecwid's JavaScript Storefront API
 * Ecwid is the single source of truth for customer identity, orders, and addresses.
 */

export const ECWID_STORE_ID = import.meta.env.VITE_ECWID_STORE_ID || '141633269';

/**
 * Safely retrieves the current logged in customer from Ecwid Storefront JS API
 */
export function getCurrentEcwidCustomer() {
  if (typeof window === 'undefined' || !window.Ecwid) {
    return null;
  }

  try {
    // 1. Try Ecwid.getProfile()
    if (window.Ecwid && typeof window.Ecwid.getProfile === 'function') {
      const prof = window.Ecwid.getProfile();
      if (prof && (prof.email || prof.id)) {
        return normalizeCustomerData(prof);
      }
    }

    // 2. Try Ecwid.getOwnerProfile()
    if (window.Ecwid && typeof window.Ecwid.getOwnerProfile === 'function') {
      const owner = window.Ecwid.getOwnerProfile();
      if (owner && (owner.email || owner.id)) {
        return normalizeCustomerData(owner);
      }
    }
  } catch (err) {
    console.warn('Error reading Ecwid customer session:', err);
  }

  return null;
}

/**
 * Normalizes customer object from Ecwid storefront API
 */
export function normalizeCustomerData(raw) {
  if (!raw) return null;

  const id = raw.id || raw.customerId || '';
  const email = raw.email || raw.customerEmail || '';
  const name = raw.name || raw.customerName || (raw.billingPerson ? raw.billingPerson.name : '') || '';
  const phone = raw.phone || (raw.billingPerson ? raw.billingPerson.phone : '') || '';

  // Extract addresses
  const shippingAddresses = Array.isArray(raw.shippingAddresses) ? raw.shippingAddresses : [];
  const billingAddress = raw.billingAddress || raw.billingPerson || null;

  const addresses = [];
  if (billingAddress && billingAddress.street) {
    addresses.push({
      id: 'billing_default',
      isDefault: true,
      type: 'Billing / Default',
      name: billingAddress.name || name || 'Customer',
      phone: billingAddress.phone || phone || '',
      street: billingAddress.street || '',
      city: billingAddress.city || '',
      state: billingAddress.stateOrProvinceCode || billingAddress.state || '',
      postalCode: billingAddress.postalCode || billingAddress.pincode || '',
      country: billingAddress.countryName || billingAddress.countryCode || 'India',
      companyName: billingAddress.companyName || ''
    });
  }

  shippingAddresses.forEach((addr, idx) => {
    addresses.push({
      id: addr.id || `shipping_${idx}`,
      isDefault: Boolean(addr.isDefault || (idx === 0 && addresses.length === 0)),
      type: addr.type || (idx === 0 ? 'Home' : 'Office'),
      name: addr.name || name || '',
      phone: addr.phone || phone || '',
      street: addr.street || addr.address1 || '',
      address2: addr.address2 || '',
      city: addr.city || '',
      state: addr.stateOrProvinceCode || addr.state || '',
      postalCode: addr.postalCode || addr.pincode || '',
      country: addr.countryName || addr.countryCode || 'India',
      companyName: addr.companyName || ''
    });
  });

  return {
    id,
    email,
    name,
    phone,
    acceptsMarketing: Boolean(raw.acceptMarketing ?? raw.acceptsMarketing),
    addresses,
    billingAddress,
    shippingAddresses,
    raw
  };
}

// Module-level state for managing Ecwid customer session listeners safely and without duplication
const customerSubscribers = new Set();
let globalEcwidListenersAttached = false;
let globalCheckInterval = null;
let lastKnownCustomerEmail = undefined;

function notifyCustomerSubscribers(customer) {
  customerSubscribers.forEach((cb) => {
    try {
      cb(customer);
    } catch (e) {
      console.warn('Error in customer subscriber callback:', e);
    }
  });
}

function checkAndUpdateCustomer() {
  const current = getCurrentEcwidCustomer();
  const currentEmail = current ? (current.email || current.id) : null;
  if (currentEmail !== lastKnownCustomerEmail) {
    lastKnownCustomerEmail = currentEmail;
    notifyCustomerSubscribers(current);
  }
}

const globalCustomerListener = () => {
  checkAndUpdateCustomer();
};

function attachGlobalEcwidListeners() {
  if (globalEcwidListenersAttached || typeof window === 'undefined' || !window.Ecwid) return;
  globalEcwidListenersAttached = true;

  try {
    if (window.Ecwid.OnSetProfile && typeof window.Ecwid.OnSetProfile.add === 'function') {
      window.Ecwid.OnSetProfile.add(globalCustomerListener);
    }
  } catch (e) {
    console.warn('Error attaching OnSetProfile:', e);
  }

  try {
    if (window.Ecwid.OnPageLoaded && typeof window.Ecwid.OnPageLoaded.add === 'function') {
      window.Ecwid.OnPageLoaded.add(globalCustomerListener);
    }
  } catch (e) {
    console.warn('Error attaching OnPageLoaded:', e);
  }

  try {
    if (window.Ecwid.OnAPILoaded && typeof window.Ecwid.OnAPILoaded.add === 'function') {
      window.Ecwid.OnAPILoaded.add(globalCustomerListener);
    }
  } catch (e) {
    console.warn('Error attaching OnAPILoaded:', e);
  }
}

function detachGlobalEcwidListeners() {
  if (!globalEcwidListenersAttached || typeof window === 'undefined' || !window.Ecwid) return;

  try {
    if (window.Ecwid.OnSetProfile && typeof window.Ecwid.OnSetProfile.remove === 'function') {
      window.Ecwid.OnSetProfile.remove(globalCustomerListener);
    }
  } catch {
    // Ignore unregister errors if not supported by storefront SDK
  }
  try {
    if (window.Ecwid.OnPageLoaded && typeof window.Ecwid.OnPageLoaded.remove === 'function') {
      window.Ecwid.OnPageLoaded.remove(globalCustomerListener);
    }
  } catch {
    // Ignore unregister errors if not supported by storefront SDK
  }
  try {
    if (window.Ecwid.OnAPILoaded && typeof window.Ecwid.OnAPILoaded.remove === 'function') {
      window.Ecwid.OnAPILoaded.remove(globalCustomerListener);
    }
  } catch {
    // Ignore unregister errors if not supported by storefront SDK
  }

  globalEcwidListenersAttached = false;
}

/**
 * Listens for Ecwid customer profile changes, sign-in, and sign-out events.
 * Manages listeners globally to prevent duplicate registrations and ensures clean teardown.
 */
export function subscribeToEcwidCustomer(callback) {
  if (typeof window === 'undefined' || typeof callback !== 'function') return () => {};

  customerSubscribers.add(callback);

  // If this is the first subscriber, attach listeners and start poll interval
  if (customerSubscribers.size === 1) {
    if (window.Ecwid) {
      attachGlobalEcwidListeners();
    }

    if (!globalCheckInterval) {
      globalCheckInterval = setInterval(() => {
        if (!globalEcwidListenersAttached && window.Ecwid) {
          attachGlobalEcwidListeners();
        }
        checkAndUpdateCustomer();
      }, 1000);
    }
  }

  // Provide initial customer value immediately to the new subscriber
  const current = getCurrentEcwidCustomer();
  try {
    callback(current);
  } catch (e) {
    console.warn('Error providing initial customer data:', e);
  }

  return () => {
    customerSubscribers.delete(callback);

    // If no more active subscribers, tear down listeners and interval
    if (customerSubscribers.size === 0) {
      if (globalCheckInterval) {
        clearInterval(globalCheckInterval);
        globalCheckInterval = null;
      }
      detachGlobalEcwidListeners();
      lastKnownCustomerEmail = undefined;
    }
  };
}

/**
 * Programmatically opens an Ecwid account page
 * Available: 'signin', 'account/settings', 'account/orders', 'account/addressBook', 'account/address-book'
 */
export function openEcwidAccountPage(page) {
  if (typeof window === 'undefined') return;

  const targetMap = {
    signin: 'signin',
    orders: 'account/orders',
    settings: 'account/settings',
    addressBook: 'account/addressBook',
    addresses: 'account/addressBook'
  };

  const resolved = targetMap[page] || page;

  if (window.Ecwid && typeof window.Ecwid.openPage === 'function') {
    try {
      window.Ecwid.openPage(resolved);
      return;
    } catch (err) {
      console.warn('Ecwid.openPage failed:', err);
    }
  }

  // Fallback to location hash format used by Ecwid
  window.location.hash = `!/~/${resolved}`;
}

/**
 * Triggers authentic Ecwid signout
 */
export function signoutEcwidCustomer(callback) {
  if (typeof window === 'undefined') return;

  try {
    if (window.Ecwid?.Customer && typeof window.Ecwid.Customer.signOut === 'function') {
      window.Ecwid.Customer.signOut();
    }
    if (window.Ecwid?.Customer && typeof window.Ecwid.Customer.signout === 'function') {
      window.Ecwid.Customer.signout();
    }
    if (window.Ecwid && typeof window.Ecwid.destroyCustomerSession === 'function') {
      window.Ecwid.destroyCustomerSession();
    }
  } catch (err) {
    console.warn('Ecwid signout error:', err);
  }

  // Also clear customer checkout session storage
  try {
    localStorage.removeItem('earthlife_customer_email');
    sessionStorage.removeItem('earthlife_customer_email');
  } catch {
    // ignore
  }

  lastKnownCustomerEmail = null;
  notifyCustomerSubscribers(null);

  // Redirect to signin view in Ecwid
  openEcwidAccountPage('signin');

  if (typeof callback === 'function') {
    callback();
  }
}

/**
 * Updates customer profile via real Ecwid backend proxy
 */
export async function updateCustomerProfile({ customerId, email, name, phone, acceptsMarketing, shippingAddresses }) {
  try {
    const res = await fetch('/api/ecwid/customer/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, email, name, phone, acceptsMarketing, shippingAddresses })
    });
    const text = await res.text();
    if (!text || !text.trim() || text.trim() === 'undefined' || text.trim() === 'null') {
      return { success: false, message: 'Empty or invalid response from server' };
    }
    const data = JSON.parse(text);
    return data;
  } catch (err) {
    return {
      success: false,
      message: err.message || 'Network error updating profile'
    };
  }
}
