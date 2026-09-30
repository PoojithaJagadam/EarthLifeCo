import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  ensureEcwidLoaded,
  addProductToEcwidCart,
  removeProductFromEcwidCart,
  clearEcwidCart,
  getEcwidCartProductsCount,
  subscribeToEcwidCart
} from '../ecwid/cart/ecwidCart';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartCount, setCartCount] = useState(0);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [customerEmail, setCustomerEmail] = useState(() => {
    try {
      return localStorage.getItem('earthlife_customer_email') || '';
    } catch {
      return '';
    }
  });

  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, product = null) => {
    setToast({ message, product });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  // Update cart count from Ecwid whenever script loads or cart changes
  useEffect(() => {
    ensureEcwidLoaded().then(() => {
      getEcwidCartProductsCount((count) => {
        setCartCount(count);
      });
    });

    const unsubscribe = subscribeToEcwidCart((ecwidCart) => {
      if (ecwidCart && typeof ecwidCart === 'object') {
        const count = ecwidCart.productsQuantity ?? ecwidCart.items?.reduce((acc, it) => acc + (it.quantity || 1), 0) ?? 0;
        setCartCount(count);
      }
    });

    return () => unsubscribe();
  }, []);

  // Add product directly to Ecwid cart (waits for Ecwid addProduct callback)
  const addToCart = async (product, quantity = 1, options = {}) => {
    try {
      const success = await addProductToEcwidCart(product, quantity, options);
      if (success) {
        showToast(`Added "${product.name}" to your cart!`, product);
        getEcwidCartProductsCount((count) => {
          setCartCount(count);
        });
        return true;
      } else {
        showToast(`Could not add "${product.name}" to cart.`);
        return false;
      }
    } catch (err) {
      console.error('Error adding to cart:', err);
      showToast(`Could not add "${product.name}" to cart.`);
      return false;
    }
  };

  // Remove item by productId directly from Ecwid
  const removeFromCart = async (itemKeyOrId) => {
    try {
      await removeProductFromEcwidCart(itemKeyOrId);
      getEcwidCartProductsCount((count) => {
        setCartCount(count);
      });
    } catch (err) {
      console.error('Error removing from cart:', err);
    }
  };

  // Clear entire Ecwid cart (or reset local count post-order without redundant Ecwid clearing)
  const clearCart = useCallback(async (notifyEcwid = true) => {
    try {
      if (notifyEcwid) {
        await clearEcwidCart();
      }
      setCartCount(0);
      if (notifyEcwid) {
        showToast('Your cart has been cleared.');
      }
    } catch (err) {
      console.error('Error clearing cart:', err);
      setCartCount(0);
    }
  }, [showToast]);

  const cartTotals = useMemo(() => ({
    subtotal: 0,
    total: 0,
    tax: 0,
    taxes: [],
    shipping: 0,
    discount: 0,
    couponDiscount: 0,
    volumeDiscount: 0
  }), []);

  return (
    <CartContext.Provider
      value={{
        cartItems: [],
        cartCount,
        cartTotal: 0,
        cartTotals,
        loadingTotals: false,
        appliedCoupon: '',
        couponError: null,
        shippingAddress,
        setShippingAddress,
        customerEmail,
        setCustomerEmail,
        applyCoupon: () => {},
        removeCoupon: () => {},
        addToCart,
        removeFromCart,
        updateQuantity: () => Promise.resolve(),
        clearCart,
        refreshTotals: () => Promise.resolve(),
        toast,
        dismissToast: () => setToast(null)
      }}
    >
      {children}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            backgroundColor: '#1E3A2B',
            color: '#FFFFFF',
            padding: '14px 22px',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.22)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            fontFamily: 'var(--font-heading, Outfit, sans-serif)',
            fontSize: '0.95rem',
            animation: 'slideUp 0.3s ease-out'
          }}
          role="status"
          aria-live="polite"
        >
          <span>🍃</span>
          <span>{toast.message}</span>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

