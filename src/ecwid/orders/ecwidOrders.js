import { getSafeApiBase } from '../storefront/ecwidStorefront';

export async function fetchCustomerOrders(email) {
  if (!email) return [];
  
  try {
    const apiBase = getSafeApiBase();
    const response = await fetch(`${apiBase}/api/ecwid/orders?email=${encodeURIComponent(email)}`);
    
    if (!response.ok) {
      console.warn(`Fetch orders response not ok: ${response.status}`);
      return [];
    }
    
    const text = await response.text();
    if (!text || typeof text !== 'string' || !text.trim() || text.trim() === 'undefined' || text.trim() === 'null') {
      return [];
    }
    
    let data = { items: [] };
    try {
      data = JSON.parse(text);
    } catch {
      return [];
    }
    return Array.isArray(data?.items) ? data.items : [];
  } catch (err) {
    console.warn('Failed to fetch orders from Ecwid:', err);
    return [];
  }
}
