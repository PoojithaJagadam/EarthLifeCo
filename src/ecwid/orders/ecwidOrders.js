const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export async function fetchCustomerOrders(email) {
  if (!email) throw new Error('Email is required to fetch orders');
  
  const response = await fetch(`${API_BASE}/api/ecwid/orders?email=${encodeURIComponent(email)}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch orders from Ecwid');
  }
  
  const data = await response.json();
  return data.items || [];
}
