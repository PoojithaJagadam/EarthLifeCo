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
    // 1. Try Ecwid.Customer.get()
    if (window.Ecwid.Customer && typeof window.Ecwid.Customer.get === 'function') {
      const cust = window.Ecwid.Customer.get();
      if (cust && (cust.email || cust.id)) {
        return normalizeCustomerData(cust);
      }
    }

    // 2. Try Ecwid.getProfile()
    if (typeof window.Ecwid.getProfile === 'function') {
      const prof = window.Ecwid.getProfile();
      if (prof && (prof.email || prof.id)) {
        return normalizeCustomerData(prof);
      }
    }

    // 3. Try Ecwid.getOwnerProfile()
    if (typeof window.Ecwid.getOwnerProfile === 'function') {
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

/**
 * Listens for Ecwid customer profile changes, sign-in, and sign-out events
 */
export function subscribeToEcwidCustomer(callback) {
  if (typeof window === 'undefined') return () => {};

  let lastEmail = null;

  const checkAndUpdate = () => {
    const current = getCurrentEcwidCustomer();
    const currentEmail = current ? (current.email || current.id) : null;
    if (currentEmail !== lastEmail) {
      lastEmail = currentEmail;
      callback(current);
    }
  };

  const registerListeners = () => {
    if (!window.Ecwid) return;

    if (window.Ecwid.OnSetProfile && typeof window.Ecwid.OnSetProfile.add === 'function') {
      window.Ecwid.OnSetProfile.add(() => {
        checkAndUpdate();
      });
    }

    if (window.Ecwid.OnPageLoaded && typeof window.Ecwid.OnPageLoaded.add === 'function') {
      window.Ecwid.OnPageLoaded.add(() => {
        checkAndUpdate();
      });
    }

    if (window.Ecwid.OnAPILoaded && typeof window.Ecwid.OnAPILoaded.add === 'function') {
      window.Ecwid.OnAPILoaded.add(() => {
        checkAndUpdate();
      });
    }
  };

  if (window.Ecwid) {
    registerListeners();
  }

  // Active check interval for smooth detection of session establishment
  const interval = setInterval(() => {
    if (window.Ecwid) {
      registerListeners();
    }
    checkAndUpdate();
  }, 1000);

  // Initial check
  checkAndUpdate();

  return () => {
    clearInterval(interval);
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

  // Redirect to signin view in Ecwid
  openEcwidAccountPage('signin');

  if (typeof callback === 'function') {
    callback();
  }
}

/**
 * Updates customer profile via real Ecwid backend proxy
 */
export async function updateCustomerProfile({ customerId, email, name, phone, acceptsMarketing }) {
  try {
    const res = await fetch('/api/ecwid/customer/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerId, email, name, phone, acceptsMarketing })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return {
      success: false,
      message: err.message || 'Network error updating profile'
    };
  }
}
