import { useState, useEffect, useCallback } from 'react';
import { fetchEcwidProducts, fetchEcwidProductById } from '../ecwid/storefront/ecwidStorefront';

/**
 * Hook to retrieve products from the live Ecwid store
 */
export function useEcwidProducts(options = {}) {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const category = options.category;
  const keyword = options.keyword;
  const limit = options.limit;
  const optOffset = options.offset;
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const refetch = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError(null);

    fetchEcwidProducts({
      category,
      keyword,
      limit,
      offset: optOffset
    })
      .then((data) => {
        if (!ignore) {
          setProducts(data?.items || []);
          setTotal(typeof data?.total === 'number' ? data.total : (data?.items ? data.items.length : 0));
          setCount(typeof data?.count === 'number' ? data.count : (data?.items ? data.items.length : 0));
          setOffset(typeof data?.offset === 'number' ? data.offset : (optOffset || 0));
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error('Error in useEcwidProducts:', err);
          setError(err.message || 'Failed to load products');
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [category, keyword, limit, optOffset, refreshTrigger]);

  return {
    products,
    total,
    count,
    offset,
    loading,
    error,
    refetch
  };
}

/**
 * Hook to retrieve a single product by Ecwid ID or slug
 */
export function useEcwidProduct(idOrSlug) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProduct = useCallback(async () => {
    if (!idOrSlug) {
      setProduct(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const item = await fetchEcwidProductById(idOrSlug);
      setProduct(item);
    } catch (err) {
      console.error(`Error loading product (${idOrSlug}):`, err);
      setError(err.message || 'Product not found');
    } finally {
      setLoading(false);
    }
  }, [idOrSlug]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  return {
    product,
    loading,
    error,
    refetch: loadProduct
  };
}

export default useEcwidProducts;
