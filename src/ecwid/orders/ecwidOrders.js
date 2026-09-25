const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').trim();

export async function fetchCustomerOrders(email) {
  if (!email) return [];
  
  try {
    const response = await fetch(`${API_BASE}/api/ecwid/orders?email=${encodeURIComponent(email)}`);
    
    if (!response.ok) {
      console.warn(`Fetch orders response not ok: ${response.status}`);
      return [];
    }
    
    const text = await response.text();
    if (!text || text.trim() === '' || text.trim() === 'undefined' || text.trim() === 'null') {
      return [];
    }
    
    const data = JSON.parse(text);
    return Array.isArray(data.items) ? data.items : [];
  } catch (err) {
    console.warn('Failed to fetch orders from Ecwid:', err);
    return [];
  }
}
