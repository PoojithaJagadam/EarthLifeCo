import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ShoppingCart
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useEcwidAccount } from '../../hooks/useEcwidAccount';
import EcwidStore from '../../ecwid/storefront/EcwidStore';
import './Checkout.css';

const Checkout = () => {
  const {
    cartTotals,
    clearCart,
    customerEmail: contextEmail
  } = useCart();

  const { customer, isLoggedIn } = useEcwidAccount();

  // Current checkout step: 2 = Ecwid Native Cart/Checkout Journey, 3 = Order Placed
  const [currentStep, setCurrentStep] = useState(2);
  const [completedOrder, setCompletedOrder] = useState(null);

  const formatPrice = (val) => {
    const num = Number(val) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // Listen for official Ecwid native order completion (fires ONLY after successful native payment via Razorpay / Ecwid)
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
          : [],
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
      };

      setCompletedOrder(orderSummaryRecord);

      // Clear cart once Ecwid confirms the order
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
  }, [cartTotals, clearCart, customer, contextEmail]);

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
            <Link to="/store">Store</Link>
            <span className="checkout-breadcrumbs-sep">/</span>
            <span className="checkout-breadcrumbs-current">Checkout</span>
          </nav>

          <div className="checkout-title-wrap">
            <div>
              <h1 className="checkout-title">Checkout</h1>
              <p className="checkout-subtitle">
                {currentStep === 3
                  ? 'Order Confirmed! Thank you for choosing EarthLife Co.'
                  : 'Complete your order securely below'}
              </p>
            </div>

            {/* Stepper Progress */}
            <div className="checkout-stepper" role="navigation" aria-label="Checkout Progress">
              <div className={`checkout-step-item ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                <div className="checkout-step-badge">
                  {currentStep > 2 ? '✓' : '1'}
                </div>
                <span className="checkout-step-label">
                  Secure Checkout
                </span>
              </div>

              <div className="checkout-stepper-divider" />

              <div className={`checkout-step-item ${currentStep === 3 ? 'active completed' : ''}`}>
                <div className="checkout-step-badge">
                  {currentStep === 3 ? '✓' : '2'}
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
                  <strong>{completedOrder.shippingAddress?.name || 'Valued Customer'}</strong>
                  <br />
                  {completedOrder.shippingAddress?.street || completedOrder.shippingAddress?.address1 || ''}
                  {completedOrder.shippingAddress?.address2 ? `, ${completedOrder.shippingAddress.address2}` : ''}
                  <br />
                  {completedOrder.shippingAddress?.city ? `${completedOrder.shippingAddress.city}, ` : ''}
                  {completedOrder.shippingAddress?.state || ''}
                  {completedOrder.shippingAddress?.postalCode ? ` - ${completedOrder.shippingAddress.postalCode}` : ''}
                  {completedOrder.shippingAddress?.phone ? <><br />Phone: {completedOrder.shippingAddress.phone}</> : null}
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
                  {completedOrder.email && <strong>Confirmation Sent To: {completedOrder.email}</strong>}
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
        ) : (
          /* Step 2: Native Ecwid Cart & Checkout Journey */
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
                    to="/store"
                    className="checkout-back-step-btn"
                    style={{ margin: 0, padding: '0.55rem 1rem', textDecoration: 'none', color: '#1E3A2B', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    id="back-to-store-btn"
                  >
                    <span>← Continue Shopping</span>
                  </Link>

                  <Link
                    to="/account"
                    className="checkout-back-step-btn"
                    style={{ margin: 0, padding: '0.55rem 1rem', textDecoration: 'none', color: '#1E3A2B', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
                    id="step2-account-section-btn"
                  >
                    <User size={15} />
                    <span>My Account</span>
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
                  {isLoggedIn && (
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
                  )}
                </div>
              </div>

              {/* Informational Guidance */}
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
                  <span>Secure Shopping Cart & Checkout</span>
                </h3>
                <p style={{ margin: 0, fontSize: '0.92rem', color: '#5A6B61', lineHeight: 1.5 }}>
                  Review your items below. You can update quantities, apply coupon codes, calculate delivery, and proceed to instant secure payment via Razorpay.
                </p>
              </div>

              {/* Native Ecwid Embed
                  - Ecwid handles cart, quantities, subtotals, shipping, GST/taxes, guest checkout / sign-in, and Razorpay payment.
                  - defaultPage="cart" allows immediate native cart display for both guest and logged-in users.
              */}
              <div style={{ minHeight: '520px' }}>
                <EcwidStore
                  key="checkout-native-ecwid-store"
                  defaultPage="cart"
                  placeholderText="Loading Ecwid Secure Shopping Cart & Checkout..."
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
                <span>Ecwid Native Commerce • 100% Encrypted • Powered by Razorpay</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
