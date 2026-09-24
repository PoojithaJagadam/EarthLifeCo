import { useState, useEffect } from 'react';
import { fetchCustomerOrders } from '../ecwid/orders/ecwidOrders';

export function useEcwidOrders(customerEmail) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!customerEmail) {
      setLoading(false);
      return;
    }

    async function loadOrders() {
      try {
        setLoading(true);
        const fetchedOrders = await fetchCustomerOrders(customerEmail);
        setOrders(fetchedOrders);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadOrders();
  }, [customerEmail]);

  return { orders, loading, error };
}
