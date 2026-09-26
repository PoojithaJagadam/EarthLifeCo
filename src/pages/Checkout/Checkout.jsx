import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Mail,
  User,
  Phone,
  Home,
  Building,
  MapPin,
  Globe,
  Check,
  Edit3,
  Trash2,
  Plus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  RotateCcw,
  ShoppingBag,
  X,
  AlertCircle,
  Lock,
  CheckCircle2,
  ShoppingCart
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useEcwidAccount } from '../../hooks/useEcwidAccount';
import EcwidStore from '../../ecwid/storefront/EcwidStore';
import { syncCartToEcwidStorefront } from '../../ecwid/cart/ecwidCart';
import './Checkout.css';

// Standard Indian States & Union Territories
const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry'
];

const Checkout = () => {
  const {
    cartItems,
    cartCount,
    cartTotals,
    loadingTotals,
    refreshTotals,
    setShippingAddress,
    clearCart,
    customerEmail: contextEmail,
    setCustomerEmail: setContextEmail
  } = useCart();

  const { customer, isLoggedIn } = useEcwidAccount();
  const [searchParams] = useSearchParams();

  // Current checkout step: 1 = Shipping/Address, 2 = Ecwid Commerce Journey, 3 = Order Placed
  const [currentStep, setCurrentStep] = useState(() => {
    const stepParam = searchParams.get('step');
    if (stepParam === 'ecwid-cart' || searchParams.get('mode') === 'native') return 2;
    return 1;
  });

  useEffect(() => {
    const stepParam = searchParams.get('step');
    if (stepParam === 'ecwid-cart') {
      setCurrentStep(2);
    }
  }, [searchParams]);

  const [completedOrder, setCompletedOrder] = useState(null);
  const [isSyncingCart, setIsSyncingCart] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const syncCart = async () => {
      if (!cartItems || cartItems.length === 0) return;
      setIsSyncingCart(true);
      try {
        await syncCartToEcwidStorefront(cartItems);
      } catch (err) {
        console.warn('Cart sync notice:', err);
      } finally {
        if (isMounted) {
          setIsSyncingCart(false);
          setCurrentStep(2);
        }
      }
    };
    
    if (currentStep === 1) {
       syncCart();
    }
    return () => { isMounted = false; };
  }, [cartItems, currentStep]);

  // Listen for official Ecwid native order completion (fires ONLY after successful native payment)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isSubscribed = true;

    const onOrderPlacedListener = async (order) => {
      if (!isSubscribed || !order || typeof order !== 'object') return;
      console.log('Real Ecwid Order Placed event received:', order);

      const orderSummaryRecord = {
        orderId: order?.orderNumber || order?.id || order?.referenceTransactionId || 'ORD-ECWID',
        id: order?.id || order?.orderNumber,
        email: order?.email || customer?.email || contextEmail || '',
        total: order?.total || cartTotals?.total || cartTotals?.subtotal,
        subtotal: order?.subtotal || cartTotals?.subtotal,
        shipping: order?.shippingPerson?.shippingMethod || cartTotals?.shipping || 0,
        tax: order?.tax || cartTotals?.tax || 0,
        paymentMethod: order?.paymentMethod || 'Razorpay / Online Payment',
        paymentStatus: order?.paymentStatus || 'PAID',
        shippingAddress: order?.shippingPerson || null,
        items: Array.isArray(order?.items) && order.items.length > 0
          ? order.items.map((it) => ({
              id: it?.id,
              name: it?.name || 'EarthLife Product',
              price: it?.price || 0,
              quantity: it?.quantity || 1,
              image: it?.imageUrl || it?.thumbnailUrl || ''
            }))
          : [...cartItems],
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      };

      setCompletedOrder(orderSummaryRecord);

      // Clear local cart once Ecwid confirms the order!
      await clearCart();
      setCurrentStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const attachListener = () => {
      if (window.Ecwid && window.Ecwid.OnOrderPlaced && typeof window.Ecwid.OnOrderPlaced.add === 'function') {
        try {
          window.Ecwid.OnOrderPlaced.add(onOrderPlacedListener);
        } catch (e) {
          console.warn('Could not attach OnOrderPlaced listener:', e);
        }
      }
    };

    if (window.Ecwid && window.Ecwid.OnOrderPlaced) {
      attachListener();
    } else {
      const timer = setInterval(() => {
        if (window.Ecwid && window.Ecwid.OnOrderPlaced) {
          clearInterval(timer);
          attachListener();
        }
      }, 500);
      return () => {
        isSubscribed = false;
        clearInterval(timer);
      };
    }

    return () => {
      isSubscribed = false;
    };
  }, [cartItems, cartTotals, clearCart, customer, contextEmail]);

  // Empty cart guard (only show if no order was just completed)
  if ((!cartItems || cartItems.length === 0) && currentStep !== 3) {
    return (
      <div className="checkout-page" id="earthlife-checkout-page">
        <section className="checkout-hero">
          <div className="checkout-hero-container">
            <nav className="checkout-breadcrumbs" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <span className="checkout-breadcrumbs-sep">/</span>
              <Link to="/cart">Cart</Link>
              <span className="checkout-breadcrumbs-sep">/</span>
              <span className="checkout-breadcrumbs-current">Checkout</span>
            </nav>
            <h1 className="checkout-title">Checkout</h1>
          </div>
        </section>

        <div className="checkout-main-container">
          <div className="checkout-section-card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem', maxWidth: '580px', margin: '2rem auto' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '50%', backgroundColor: '#EAF0EC', color: '#1E3A2B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem' }}>
              <ShoppingBag size={32} />
            </div>
            <h2 style={{ fontFamily: 'var(--font-heading, Outfit, sans-serif)', fontSize: '1.45rem', color: '#1E3A2B', marginBottom: '0.75rem' }}>
              Your Cart is Empty
            </h2>
            <p style={{ color: '#5A6B61', fontSize: '0.95rem', lineHeight: 1.55, marginBottom: '1.75rem' }}>
              You don’t have any items in your cart to checkout yet. Browse our handcrafted natural bamboo and neem essentials to get started.
            </p>
            <Link
              to="/store"
              className="checkout-continue-btn"
              style={{ textDecoration: 'none', maxWidth: '240px', margin: '0 auto' }}
            >
              <span>Explore Store</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page" id="earthlife-checkout-page">
      {/* 1. Hero Header & Stepper */}
      <section className="checkout-hero">
        <svg className="checkout-hero-leaf-left" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 0 C70 30 90 60 50 100 C10 60 30 30 50 0 Z" fill="#2C4A3B" />
        </svg>
        <svg className="checkout-hero-leaf-right" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 0 C70 30 90 60 50 100 C10 60 30 30 50 0 Z" fill="#2C4A3B" />
        </svg>

        <div className="checkout-hero-container">
          <nav className="checkout-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="checkout-breadcrumbs-sep">/</span>
            <Link to="/cart">Cart</Link>
            <span className="checkout-breadcrumbs-sep">/</span>
            <span className="checkout-breadcrumbs-current">Checkout</span>
          </nav>

          <div className="checkout-title-wrap">
            <div>
              <h1 className="checkout-title">Checkout</h1>
              <p className="checkout-subtitle">
                {currentStep === 1 && 'Preparing your secure checkout...'}
                {currentStep === 2 && 'Complete your order securely below'}
                {currentStep === 3 && 'Order Confirmed! Thank you for choosing EarthLife Co.'}
              </p>
            </div>

            {/* Stepper Progress: Checkout -> Order Placed */}
            <div className="checkout-stepper" role="navigation" aria-label="Checkout Progress">
              <div className={`checkout-step-item ${currentStep === 1 || currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                <div className="checkout-step-badge">
                  {currentStep > 2 ? <Check size={16} /> : '1'}
                </div>
                <span className="checkout-step-label">
                  Secure Checkout
                </span>
              </div>

              <div className="checkout-stepper-divider" />

              <div className={`checkout-step-item ${currentStep === 3 ? 'active completed' : ''}`}>
                <div className="checkout-step-badge">
                  {currentStep === 3 ? <Check size={16} /> : '2'}
                </div>
                <span className="checkout-step-label">Order Placed</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Main Content Container */}
      <div className="checkout-main-container">
        {currentStep === 3 && completedOrder ? (
          /* Step 3: Order Placed Confirmation Screen */
          <div className="checkout-order-placed-container" id="checkout-order-placed-view">
            <div className="checkout-order-placed-icon">
              <CheckCircle2 size={44} />
            </div>
            <h2 className="checkout-order-placed-title">Order Confirmed!</h2>
            <p className="checkout-order-placed-subtitle">
              Thank you for choosing EarthLife Co. Your order has been registered and verified in our Ecwid store.
            </p>

            <div className="checkout-order-placed-id-badge">
              <span>Order ID:</span>
              <strong>#{completedOrder.orderId || completedOrder.id}</strong>
            </div>

            <div className="checkout-order-placed-grid">
              <div className="checkout-order-placed-box">
                <h4>Shipping To</h4>
                <p>
                  <strong>{completedOrder.shippingAddress?.name}</strong>
                  <br />
                  {completedOrder.shippingAddress?.street || completedOrder.shippingAddress?.address1}
                  {completedOrder.shippingAddress?.address2 ? `, ${completedOrder.shippingAddress.address2}` : ''}
                  <br />
                  {completedOrder.shippingAddress?.city}, {completedOrder.shippingAddress?.state} - {completedOrder.shippingAddress?.postalCode || completedOrder.shippingAddress?.pincode}
                  <br />
                  Phone: {completedOrder.shippingAddress?.phone}
                </p>
              </div>

              <div className="checkout-order-placed-box">
                <h4>Payment & Status</h4>
                <p>
                  <strong>Method:</strong> {completedOrder.paymentMethod}
                  <br />
                  <strong>Payment Status:</strong> {completedOrder.paymentStatus === 'PAID' ? 'Paid Online via Razorpay' : completedOrder.paymentStatus}
                  <br />
                  <strong>Total Amount:</strong> {formatPrice(completedOrder.total)}
                  <br />
                  <strong>Confirmation Sent To:</strong> {completedOrder.email}
                </p>
              </div>
            </div>

            <div className="checkout-order-placed-actions">
              <Link to="/store" className="checkout-order-placed-primary-btn" id="continue-shopping-btn">
                <span>Continue Shopping</span>
                <ArrowRight size={18} />
              </Link>
              <Link to="/" className="checkout-order-placed-sec-btn" id="back-to-home-btn">
                <span>Return to Home</span>
              </Link>
            </div>
          </div>
        ) : currentStep === 2 ? (
          /* Step 2: Native Ecwid Journey */
          /* Flow:
             - Check customer login
             - If logged in: Native Ecwid Shopping Cart (starting commerce step)
             - If not logged in: Native Ecwid Sign In (email + access code -> on login -> Native Ecwid Shopping Cart)
             - Native Ecwid Shopping Cart -> Native Ecwid Checkout -> Shipping -> Razorpay -> Ecwid Order
          */
          <div className="checkout-step2-wrapper" id="checkout-step-2-view">
            <div
              className="checkout-native-ecwid-card"
              id="checkout-native-ecwid-container"
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #ECE4D8',
                padding: '2rem',
                marginBottom: '2rem',
                boxShadow: '0 4px 18px rgba(30, 58, 43, 0.04)'
              }}
            >
              {/* Header with Navigation and Authentication Status */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '1.5rem',
                  paddingBottom: '1.25rem',
                  borderBottom: '1px solid #ECE4D8',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <Link
                    to="/cart"
                    className="checkout-back-step-btn"
                    style={{ margin: 0, padding: '0.55rem 1rem', textDecoration: 'none', color: '#1E3A2B', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    id="back-to-cart-btn"
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Cart</span>
                  </Link>

                  <Link
                    to="/account"
                    className="checkout-back-step-btn"
                    style={{ margin: 0, padding: '0.55rem 1rem', textDecoration: 'none', color: '#1E3A2B', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    id="step2-account-section-btn"
                  >
                    <User size={15} />
                    <span>Account Section</span>
                  </Link>
                </div>

                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    fontSize: '0.9rem',
                    color: '#1E3A2B',
                    fontWeight: 600
                  }}
                >
                  {isLoggedIn ? (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        backgroundColor: '#E8F2EC',
                        color: '#1E3A2B',
                        padding: '0.4rem 0.85rem',
                        borderRadius: '20px'
                      }}
                    >
                      <User size={15} />
                      <span>
                        Logged in as <strong>{customer?.name || customer?.email}</strong>
                      </span>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        backgroundColor: '#FFF4E5',
                        color: '#B25E09',
                        padding: '0.4rem 0.85rem',
                        borderRadius: '20px'
                      }}
                    >
                      <Lock size={15} />
                      <span>Ecwid Venture Sign In Required</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Informational Guidance for Flow */}
              {!isLoggedIn ? (
                <div
                  style={{
                    backgroundColor: '#F8F6F0',
                    border: '1px solid #EAE4D9',
                    borderRadius: '10px',
                    padding: '1.25rem 1.5rem',
                    marginBottom: '1.75rem'
                  }}
                >
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading, Outfit, sans-serif)',
                      fontSize: '1.15rem',
                      color: '#1E3A2B',
                      marginBottom: '0.4rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <Mail size={18} />
                    <span>Native Ecwid Sign In</span>
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.92rem', color: '#5A6B61', lineHeight: 1.5 }}>
                    Please enter your email below. Ecwid will send a secure one-time access code to your inbox.
                    Once verified, your <strong>Native Ecwid Shopping Cart</strong> will automatically open with all {cartCount} items preserved, ready for native checkout and Razorpay payment.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: '#F8F6F0',
                    border: '1px solid #EAE4D9',
                    borderRadius: '10px',
                    padding: '1.25rem 1.5rem',
                    marginBottom: '1.75rem'
                  }}
                >
                  <h3
                    style={{
                      fontFamily: 'var(--font-heading, Outfit, sans-serif)',
                      fontSize: '1.15rem',
                      color: '#1E3A2B',
                      marginBottom: '0.4rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <ShoppingCart size={18} />
                    <span>Native Ecwid Shopping Cart</span>
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.92rem', color: '#5A6B61', lineHeight: 1.5 }}>
                    Your cart items have been synced to your authenticated session. Review your items and click <strong>Checkout</strong> to proceed to shipping and secure payment via Razorpay.
                  </p>
                </div>
              )}

              {/* Native Ecwid Embed
                  - If NOT logged in: renders native 'signin' (email + access code)
                  - If logged in: renders native 'cart' (starting commerce step)
                  - Transition from signin -> cart is automatic once login completes!
              */}
              <div style={{ minHeight: '520px' }}>
                <EcwidStore
                  key="checkout-native-ecwid-store"
                  defaultPage={isLoggedIn ? 'cart' : 'signin'}
                  placeholderText={
                    isLoggedIn
                      ? 'Loading Native Ecwid Shopping Cart...'
                      : 'Loading Native Ecwid Sign In...'
                  }
                />
              </div>

              {/* Trust Footer */}
              <div
                style={{
                  marginTop: '1.75rem',
                  paddingTop: '1.25rem',
                  borderTop: '1px solid #ECE4D8',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '0.85rem',
                  color: '#7B8B80'
                }}
              >
                <ShieldCheck size={16} style={{ color: '#2E7D32' }} />
                <span>Ecwid Venture Native Commerce • 100% Encrypted • Powered by Razorpay</span>
              </div>
            </div>
          </div>
        ) : (
          /* Step 1: Loading view */
          <div className="checkout-grid" style={{ display: 'flex', justifyContent: 'center', padding: '4rem 0', minHeight: '400px' }}>
            <div style={{ textAlign: 'center', color: '#1E3A2B' }}>
              <ShoppingCart size={40} style={{ opacity: 0.5, marginBottom: '1rem' }} />
              <h3>Syncing your cart securely...</h3>
              <p style={{ color: '#5A6B61', marginTop: '0.5rem' }}>Please wait while we prepare your checkout.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
