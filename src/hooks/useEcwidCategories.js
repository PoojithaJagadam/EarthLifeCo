import { useState, useEffect } from 'react';
import { fetchEcwidCategories } from '../ecwid/storefront/ecwidStorefront';

export function useEcwidCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const data = await fetchEcwidCategories();
        if (mounted) {
          setCategories(data.items || []);
        }
      } catch (err) {
        if (mounted) {
          console.error('Error loading Ecwid categories:', err);
          setError(err.message);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => { mounted = false; };
  }, []);

  return { categories, loading, error };
}

export default useEcwidCategories;
