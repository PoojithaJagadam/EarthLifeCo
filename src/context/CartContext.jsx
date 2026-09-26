import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  ensureEcwidLoaded,
  getSavedCartItems,
  addProductToEcwidCart,
  removeProductFromEcwidCart,
  updateProductQuantityInEcwidCart,
  clearEcwidCart,
  calculateEcwidOrder,
  subscribeToEcwidCart
} from '../ecwid/cart/ecwidCart';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => getSavedCartItems());
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponError, setCouponError] = useState(null);
  const [shippingAddress, setShippingAddress] = useState(null);
  const [customerEmail, setCustomerEmail] = useState(() => {
    try {
      return localStorage.getItem('earthlife_customer_email') || '';
    } catch {
      return '';
    }
  });
  const [loadingTotals, setLoadingTotals] = useState(false);
  const [cartTotals, setCartTotals] = useState({
    subtotal: 0,
    total: 0,
    tax: 0,
    taxes: [],
    shipping: 0,
    discount: 0,
    couponDiscount: 0,
    volumeDiscount: 0
  });

  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, product = null) => {
    setToast({ message, product });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  // Recalculate totals whenever items or applied coupon or shipping address change
  const refreshTotals = useCallback(async (items, coupon = appliedCoupon, address = shippingAddress) => {
    if (!items || items.length === 0) {
      setCartTotals({
        subtotal: 0,
        total: 0,
        tax: 0,
        taxes: [],
        shipping: 0,
        discount: 0,
        couponDiscount: 0,
        volumeDiscount: 0
      });
      setCouponError(null);
      return;
    }

    setLoadingTotals(true);
    try {
      const calculated = await calculateEcwidOrder(items, coupon, address);
      setCartTotals(calculated);
      if (calculated.couponError) {
        setCouponError(calculated.couponError);
      } else {
        setCouponError(null);
      }
    } catch (err) {
      console.error('Failed to calculate Ecwid cart totals:', err);
    } finally {
      setLoadingTotals(false);
    }
  }, [appliedCoupon, shippingAddress]);

  // Initialize Ecwid script & subscribe to Ecwid storefront changes
  useEffect(() => {
    ensureEcwidLoaded();

    const unsubscribe = subscribeToEcwidCart((ecwidCart) => {
      // When Ecwid Storefront updates cart items, we can sync
      if (ecwidCart && typeof ecwidCart === 'object') {
        refreshTotals(cartItems, appliedCoupon);
      }
    });

    return () => unsubscribe();
  }, [cartItems, appliedCoupon, refreshTotals]);

  useEffect(() => {
    refreshTotals(cartItems, appliedCoupon);
  }, [cartItems, appliedCoupon, refreshTotals]);

  // Add product to cart with selected options
  const addToCart = async (product, quantity = 1, options = {}) => {
    try {
      const updated = await addProductToEcwidCart(product, quantity, options);
      setCartItems(updated);
      showToast(`Added "${product.name}" to your cart!`, product);
      return true;
    } catch (err) {
      console.error('Error adding to cart:', err);
      showToast(`Could not add "${product.name}" to cart.`);
      return false;
    }
  };

  // Remove item by itemKey or productId
  const removeFromCart = async (itemKeyOrId) => {
    try {
      // Find actual itemKey if productId was passed
      const target = cartItems.find(
        (it) => it.itemKey === itemKeyOrId || it.productId === itemKeyOrId || it.id === itemKeyOrId
      );
      const keyToRemove = target ? target.itemKey : itemKeyOrId;
      const updated = await removeProductFromEcwidCart(keyToRemove);
      setCartItems(updated);
      if (target) {
        showToast(`Removed "${target.name}" from your cart.`);
      }
    } catch (err) {
      console.error('Error removing from cart:', err);
    }
  };

  // Update item quantity
  const updateQuantity = async (itemKeyOrId, quantity) => {
    try {
      const target = cartItems.find(
        (it) => it.itemKey === itemKeyOrId || it.productId === itemKeyOrId || it.id === itemKeyOrId
      );
      const keyToUpdate = target ? target.itemKey : itemKeyOrId;
      const updated = await updateProductQuantityInEcwidCart(keyToUpdate, quantity);
      setCartItems(updated);
    } catch (err) {
      console.error('Error updating quantity:', err);
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    try {
      const updated = await clearEcwidCart();
      setCartItems(updated);
      setAppliedCoupon('');
      setCouponError(null);
      showToast('Your cart has been cleared.');
    } catch (err) {
      console.error('Error clearing cart:', err);
    }
  };

  // Apply coupon code via Ecwid calculate
  const applyCoupon = async (code) => {
    const trimmed = String(code || '').trim();
    if (!trimmed) {
      setAppliedCoupon('');
      setCouponError(null);
      return;
    }

    setAppliedCoupon(trimmed);
  };

  const removeCoupon = () => {
    setAppliedCoupon('');
    setCouponError(null);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + (Number(item.quantity) || 1), 0);
  const cartTotal = cartTotals.total || cartTotals.subtotal || cartItems.reduce(
    (acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        cartTotals,
        loadingTotals,
        appliedCoupon,
        couponError,
        shippingAddress,
        setShippingAddress,
        customerEmail,
        setCustomerEmail,
        applyCoupon,
        removeCoupon,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        refreshTotals,
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
