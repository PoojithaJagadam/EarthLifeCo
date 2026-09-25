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

  // Customer Contact Email
  const [email, setEmail] = useState(() => {
    try {
      const val = customer?.email || contextEmail || localStorage.getItem('earthlife_customer_email') || '';
      return (val && val !== 'undefined' && val !== 'null') ? val : '';
    } catch {
      return '';
    }
  });
  const [emailError, setEmailError] = useState('');

  // Update email if Ecwid customer logs in
  useEffect(() => {
    if (customer?.email && !email) {
      setEmail(customer.email);
    }
  }, [customer, email]);

  // Real Customer Saved Addresses from session/storage
  const [savedAddresses, setSavedAddresses] = useState(() => {
    try {
      const saved = localStorage.getItem('earthlife_saved_addresses');
      if (!saved || saved === 'undefined' || saved === 'null') return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  // Selected Address ID
  const [selectedAddressId, setSelectedAddressId] = useState(() => {
    try {
      const saved = localStorage.getItem('earthlife_saved_addresses');
      if (!saved || saved === 'undefined' || saved === 'null') return null;
      const list = JSON.parse(saved);
      return Array.isArray(list) && list.length > 0 ? list[0].id : null;
    } catch {
      return null;
    }
  });

  // Active Tab: 'saved' or 'new'
  const [activeAddressTab, setActiveAddressTab] = useState(() => {
    try {
      const saved = localStorage.getItem('earthlife_saved_addresses');
      if (!saved || saved === 'undefined' || saved === 'null') return 'new';
      const list = JSON.parse(saved);
      return Array.isArray(list) && list.length > 0 ? 'saved' : 'new';
    } catch {
      return 'new';
    }
  });

  // Modal State for Add / Edit Address
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);

  // Address Form State
  const [addressFormData, setAddressFormData] = useState({
    name: '',
    phone: '',
    street: '',
    address2: '',
    city: '',
    state: 'Karnataka',
    postalCode: '',
    country: 'India',
    saveForFuture: true
  });
  const [formErrors, setFormErrors] = useState({});

  // Format currency in Indian Rupees
  const formatPrice = (val) => {
    const num = Number(val) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // Keep active address in sync with CartContext & calculate real Ecwid totals
  useEffect(() => {
    const active = savedAddresses.find((a) => a.id === selectedAddressId);
    if (active) {
      setShippingAddress(active);
      refreshTotals(cartItems, null, active);
    }
  }, [selectedAddressId, savedAddresses, cartItems, refreshTotals, setShippingAddress]);

  // Ensure cart contents are preserved and synced to Ecwid when on Step 2
  useEffect(() => {
    if (currentStep === 2 && cartItems && cartItems.length > 0) {
      syncCartToEcwidStorefront(cartItems);

      // If user is logged in, ensure Ecwid opens the native shopping cart
      if (isLoggedIn && window.Ecwid && typeof window.Ecwid.openPage === 'function') {
        try {
          window.Ecwid.openPage('cart');
        } catch (e) {
          console.warn('Ecwid openPage cart error:', e);
        }
      }
    }
  }, [currentStep, isLoggedIn, cartItems]);

  // Listen for official Ecwid native order completion (fires ONLY after successful native payment)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    let isSubscribed = true;

    const onOrderPlacedListener = async (order) => {
      if (!isSubscribed || !order || typeof order !== 'object') return;
      console.log('Real Ecwid Order Placed event received:', order);

      const activeAddr = Array.isArray(savedAddresses) ? savedAddresses.find((a) => a && a.id === selectedAddressId) : null;
      const verifiedAddress = activeAddr || (Array.isArray(savedAddresses) && savedAddresses.length > 0 ? savedAddresses[0] : null);

      const orderSummaryRecord = {
        orderId: order?.orderNumber || order?.id || order?.referenceTransactionId || 'ORD-ECWID',
        id: order?.id || order?.orderNumber,
        email: order?.email || customer?.email || contextEmail || email || '',
        total: order?.total || cartTotals?.total || cartTotals?.subtotal,
        subtotal: order?.subtotal || cartTotals?.subtotal,
        shipping: order?.shippingPerson?.shippingMethod || cartTotals?.shipping || 0,
        tax: order?.tax || cartTotals?.tax || 0,
        paymentMethod: order?.paymentMethod || 'Razorpay / Online Payment',
        paymentStatus: order?.paymentStatus || 'PAID',
        shippingAddress: order?.shippingPerson || verifiedAddress,
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
  }, [cartItems, cartTotals, clearCart, customer, contextEmail, email, savedAddresses, selectedAddressId]);

  // Handle opening modal for adding new address
  const handleOpenAddModal = () => {
    setEditingAddressId(null);
    setAddressFormData({
      name: customer?.name || '',
      phone: customer?.phone || '',
      street: '',
      address2: '',
      city: '',
      state: 'Karnataka',
      postalCode: '',
      country: 'India',
      saveForFuture: true
    });
    setFormErrors({});
    setModalOpen(true);
  };

  // Handle opening modal for editing an address
  const handleOpenEditModal = (addr, e) => {
    if (e) e.stopPropagation();
    setEditingAddressId(addr.id);
    setAddressFormData({
      name: addr.name || '',
      phone: addr.phone || '',
      street: addr.street || addr.address1 || '',
      address2: addr.address2 || '',
      city: addr.city || '',
      state: addr.state || 'Karnataka',
      postalCode: addr.postalCode || addr.pincode || '',
      country: addr.country || 'India',
      saveForFuture: true
    });
    setFormErrors({});
    setModalOpen(true);
  };

  // Handle deleting a saved address
  const handleDeleteAddress = (id, e) => {
    if (e) e.stopPropagation();
    const updated = savedAddresses.filter((a) => a.id !== id);
    setSavedAddresses(updated);
    try {
      localStorage.setItem('earthlife_saved_addresses', JSON.stringify(updated));
    } catch {
      // ignore
    }

    if (selectedAddressId === id) {
      const nextId = updated.length > 0 ? updated[0].id : null;
      setSelectedAddressId(nextId);
      if (!nextId) {
        setActiveAddressTab('new');
        setShippingAddress(null);
      }
    }
  };

  // Validate Address Form
  const validateAddressForm = () => {
    const errors = {};
    if (!addressFormData.name.trim()) errors.name = 'Full name is required';
    if (!addressFormData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^[0-9+ -]{8,15}$/.test(addressFormData.phone.trim())) {
      errors.phone = 'Please enter a valid phone number';
    }
    if (!addressFormData.street.trim()) errors.street = 'Street address is required';
    if (!addressFormData.city.trim()) errors.city = 'City is required';
    if (!addressFormData.state) errors.state = 'State is required';
    if (!addressFormData.postalCode.trim()) {
      errors.postalCode = 'Postal / PIN code is required';
    } else if (!/^[0-9]{6}$/.test(addressFormData.postalCode.trim())) {
      errors.postalCode = 'PIN code must be 6 digits';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Save address from modal
  const handleSaveModalAddress = (e) => {
    e.preventDefault();
    if (!validateAddressForm()) return;

    const newAddressObj = {
      id: editingAddressId || `addr_${Date.now()}`,
      name: addressFormData.name.trim(),
      phone: addressFormData.phone.trim(),
      street: addressFormData.street.trim(),
      address1: addressFormData.street.trim(),
      address2: addressFormData.address2.trim(),
      city: addressFormData.city.trim(),
      state: addressFormData.state,
      postalCode: addressFormData.postalCode.trim(),
      pincode: addressFormData.postalCode.trim(),
      country: addressFormData.country,
      isDefault: savedAddresses.length === 0
    };

    let updatedList;
    if (editingAddressId) {
      updatedList = savedAddresses.map((a) => (a.id === editingAddressId ? newAddressObj : a));
    } else {
      updatedList = [...savedAddresses, newAddressObj];
    }

    setSavedAddresses(updatedList);
    try {
      localStorage.setItem('earthlife_saved_addresses', JSON.stringify(updatedList));
    } catch {
      // ignore
    }

    setSelectedAddressId(newAddressObj.id);
    setShippingAddress(newAddressObj);
    setActiveAddressTab('saved');
    setModalOpen(false);

    // Recalculate live Ecwid totals with the newly saved address
    refreshTotals(cartItems, null, newAddressObj);
  };

  // Inline "Add New Address" submission when tab is active
  const handleInlineSaveAddress = (e) => {
    e.preventDefault();
    if (!validateAddressForm()) return;

    const newAddressObj = {
      id: `addr_${Date.now()}`,
      name: addressFormData.name.trim(),
      phone: addressFormData.phone.trim(),
      street: addressFormData.street.trim(),
      address1: addressFormData.street.trim(),
      address2: addressFormData.address2.trim(),
      city: addressFormData.city.trim(),
      state: addressFormData.state,
      postalCode: addressFormData.postalCode.trim(),
      pincode: addressFormData.postalCode.trim(),
      country: addressFormData.country,
      isDefault: savedAddresses.length === 0
    };

    if (addressFormData.saveForFuture) {
      const updatedList = [...savedAddresses, newAddressObj];
      setSavedAddresses(updatedList);
      try {
        localStorage.setItem('earthlife_saved_addresses', JSON.stringify(updatedList));
      } catch {
        // ignore
      }
    }

    setSelectedAddressId(newAddressObj.id);
    setShippingAddress(newAddressObj);
    setActiveAddressTab('saved');

    // Recalculate live Ecwid totals
    refreshTotals(cartItems, null, newAddressObj);
  };

  // Validate Contact Email
  const validateEmail = (val) => {
    const trimmed = String(val || '').trim();
    if (!trimmed) {
      setEmailError('Email address is required for order confirmation');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmed)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  // Continue to Payment action (Step 1 -> Step 2)
  // Required flow:
  // Cart -> shipping address -> continue to payment
  // → Check customer login
  // → If logged in: Native Ecwid Shopping Cart
  // → If not logged in: Native Ecwid Sign In
  const handleContinueToPayment = async (e) => {
    e.preventDefault();

    // 1. Validate email
    const isEmailValid = validateEmail(email);
    if (!isEmailValid) {
      window.scrollTo({ top: 120, behavior: 'smooth' });
      return;
    }

    // 2. Validate address
    let activeAddr = savedAddresses.find((a) => a.id === selectedAddressId);
    if (!activeAddr) {
      // If currently on "new" address tab, try validating and saving inline form
      if (activeAddressTab === 'new') {
        const isFormValid = validateAddressForm();
        if (!isFormValid) {
          window.scrollTo({ top: 280, behavior: 'smooth' });
          return;
        }
        activeAddr = {
          id: `addr_${Date.now()}`,
          name: addressFormData.name.trim(),
          phone: addressFormData.phone.trim(),
          street: addressFormData.street.trim(),
          address1: addressFormData.street.trim(),
          address2: addressFormData.address2.trim(),
          city: addressFormData.city.trim(),
          state: addressFormData.state,
          postalCode: addressFormData.postalCode.trim(),
          pincode: addressFormData.postalCode.trim(),
          country: addressFormData.country,
          isDefault: true
        };
        const updatedList = [...savedAddresses, activeAddr];
        setSavedAddresses(updatedList);
        setSelectedAddressId(activeAddr.id);
        try {
          localStorage.setItem('earthlife_saved_addresses', JSON.stringify(updatedList));
        } catch {
          // ignore
        }
      } else {
        setFormErrors((prev) => ({ ...prev, address: 'Please select or add a shipping address before continuing.' }));
        return;
      }
    }

    // Store verified email in storage and context
    try {
      localStorage.setItem('earthlife_customer_email', email.trim());
    } catch {
      // ignore
    }
    if (setContextEmail) setContextEmail(email.trim());
    setShippingAddress(activeAddr);

    // Synchronize current cart contents into Ecwid storefront before proceeding
    setIsSyncingCart(true);
    try {
      await syncCartToEcwidStorefront(cartItems);
    } catch (syncErr) {
      console.warn('Cart sync notice:', syncErr);
    } finally {
      setIsSyncingCart(false);
    }

    // Required flow:
    // Cart -> shipping address -> continue to payment
    // Proceed directly to Step 2 (Native Ecwid Cart & Payment flow right in Checkout)
    // If user is already logged in, Ecwid opens Cart. If not, Ecwid opens Sign-in in Step 2.
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
                {currentStep === 1 && 'Step 1: Enter your delivery and shipping address'}
                {currentStep === 2 && (isLoggedIn ? 'Step 2: Ecwid Shopping Cart & Razorpay Checkout' : 'Step 2: Ecwid Account Sign In')}
                {currentStep === 3 && 'Order Confirmed! Thank you for choosing EarthLife Co.'}
              </p>
            </div>

            {/* Stepper Progress: Shipping -> Ecwid Cart & Checkout -> Order Placed */}
            <div className="checkout-stepper" role="navigation" aria-label="Checkout Progress">
              <div
                className={`checkout-step-item ${currentStep === 1 ? 'active' : ''} ${currentStep > 1 ? 'completed clickable' : ''}`}
                onClick={() => {
                  if (currentStep === 2) setCurrentStep(1);
                }}
                title={currentStep === 2 ? 'Click to edit shipping address' : undefined}
              >
                <div className="checkout-step-badge">
                  {currentStep > 1 ? <Check size={16} /> : '1'}
                </div>
                <span className="checkout-step-label">Shipping</span>
              </div>

              <div className="checkout-stepper-divider" />

              <div className={`checkout-step-item ${currentStep === 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                <div className="checkout-step-badge">
                  {currentStep > 2 ? <Check size={16} /> : '2'}
                </div>
                <span className="checkout-step-label">
                  {isLoggedIn ? 'Cart & Checkout' : 'Sign In & Cart'}
                </span>
              </div>

              <div className="checkout-stepper-divider" />

              <div className={`checkout-step-item ${currentStep === 3 ? 'active completed' : ''}`}>
                <div className="checkout-step-badge">
                  {currentStep === 3 ? <Check size={16} /> : '3'}
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
                  <button
                    type="button"
                    className="checkout-back-step-btn"
                    style={{ margin: 0, padding: '0.55rem 1rem' }}
                    onClick={() => setCurrentStep(1)}
                    id="back-to-shipping-address-btn"
                  >
                    <ArrowLeft size={16} />
                    <span>Edit Shipping Details</span>
                  </button>

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
          /* Step 1: Contact Information & Shipping Address Form + Order Summary */
          <div className="checkout-grid">
            {/* Left Column: Form */}
            <div className="checkout-left-col">
              {/* Contact Email Section */}
              <section className="checkout-section-card" aria-labelledby="contact-heading">
                <div className="checkout-section-header">
                  <h2 className="checkout-section-title" id="contact-heading">
                    <Mail size={20} />
                    <span>Contact Information</span>
                  </h2>
                  <p className="checkout-section-desc">
                    We'll send your live order confirmation, tracking updates, and receipt to this address.
                  </p>
                </div>

                <div className="checkout-input-group">
                  <label htmlFor="customer-email" className="checkout-input-label">
                    Email Address <span style={{ color: '#D32F2F' }}>*</span>
                  </label>
                  <div className="checkout-input-wrapper">
                    <Mail size={18} className="checkout-input-icon" />
                    <input
                      type="email"
                      id="customer-email"
                      className={`checkout-input ${emailError ? 'error' : ''}`}
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) validateEmail(e.target.value);
                      }}
                      onBlur={() => validateEmail(email)}
                      required
                      autoComplete="email"
                    />
                  </div>
                  {emailError && (
                    <div className="checkout-field-error">
                      <AlertCircle size={13} style={{ display: 'inline', verticalAlign: '-1px', marginRight: '4px' }} />
                      {emailError}
                    </div>
                  )}
                </div>
              </section>

              {/* Shipping Address Section */}
              <section className="checkout-section-card" aria-labelledby="shipping-heading">
                <div className="checkout-section-header">
                  <h2 className="checkout-section-title" id="shipping-heading">
                    <Truck size={20} />
                    <span>Shipping Address</span>
                  </h2>
                  <p className="checkout-section-desc">
                    Where should we deliver your handcrafted EarthLife essentials?
                  </p>
                </div>

                {/* Tabs: Saved Addresses vs Add New Address */}
                {savedAddresses.length > 0 && (
                  <div className="checkout-address-tabs" role="tablist">
                    <button
                      type="button"
                      className={`checkout-tab-btn ${activeAddressTab === 'saved' ? 'active' : ''}`}
                      onClick={() => setActiveAddressTab('saved')}
                      role="tab"
                      aria-selected={activeAddressTab === 'saved'}
                    >
                      <Home size={16} />
                      <span>Saved Addresses ({savedAddresses.length})</span>
                    </button>

                    <button
                      type="button"
                      className={`checkout-tab-btn ${activeAddressTab === 'new' ? 'active' : ''}`}
                      onClick={() => {
                        setActiveAddressTab('new');
                        handleOpenAddModal();
                      }}
                      role="tab"
                      aria-selected={activeAddressTab === 'new'}
                    >
                      <Plus size={16} />
                      <span>Add New Address</span>
                    </button>
                  </div>
                )}

                {/* View: Saved Addresses List */}
                {activeAddressTab === 'saved' && savedAddresses.length > 0 ? (
                  <div>
                    <div className="checkout-saved-list" role="radiogroup" aria-label="Saved shipping addresses">
                      {savedAddresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.id;
                        return (
                          <div
                            key={addr.id}
                            className={`checkout-address-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => setSelectedAddressId(addr.id)}
                            role="radio"
                            aria-checked={isSelected}
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === ' ' || e.key === 'Enter') setSelectedAddressId(addr.id);
                            }}
                          >
                            <div className="checkout-radio-wrap">
                              <div className="checkout-custom-radio">
                                {isSelected && <div className="checkout-radio-inner" />}
                              </div>
                            </div>

                            <div className="checkout-address-info">
                              <div className="checkout-address-name-row">
                                <span className="checkout-address-name">{addr.name}</span>
                                {addr.isDefault && (
                                  <span className="checkout-address-default-badge">Default</span>
                                )}
                              </div>
                              <div className="checkout-address-line">
                                {addr.street || addr.address1}
                                {addr.address2 ? `, ${addr.address2}` : ''}
                              </div>
                              <div className="checkout-address-line">
                                {addr.city}, {addr.state} - {addr.postalCode || addr.pincode}
                              </div>
                              <div className="checkout-address-phone">
                                <Phone size={13} />
                                <span>{addr.phone}</span>
                              </div>
                            </div>

                            <div className="checkout-address-actions">
                              <button
                                type="button"
                                className="checkout-addr-action-btn"
                                onClick={(e) => handleOpenEditModal(addr, e)}
                                title="Edit address"
                                aria-label={`Edit address for ${addr.name}`}
                              >
                                <Edit3 size={14} />
                                <span>Edit</span>
                              </button>
                              <button
                                type="button"
                                className="checkout-addr-action-btn delete"
                                onClick={(e) => handleDeleteAddress(addr.id, e)}
                                title="Delete address"
                                aria-label={`Delete address for ${addr.name}`}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      className="checkout-addr-action-btn"
                      onClick={handleOpenAddModal}
                      style={{ padding: '0.65rem 1rem', fontSize: '0.9rem', color: '#1E3A2B', fontWeight: 600 }}
                    >
                      <Plus size={16} />
                      <span>Add Another Address</span>
                    </button>
                  </div>
                ) : (
                  /* View: Inline Add New Address Form */
                  <form onSubmit={handleInlineSaveAddress} className="checkout-modal-form" style={{ padding: 0 }}>
                    <div className="checkout-form-row">
                      <div className="checkout-input-group">
                        <label className="checkout-input-label">
                          Full Name <span style={{ color: '#D32F2F' }}>*</span>
                        </label>
                        <div className="checkout-input-wrapper">
                          <User size={18} className="checkout-input-icon" />
                          <input
                            type="text"
                            className={`checkout-input ${formErrors.name ? 'error' : ''}`}
                            placeholder="Full legal name"
                            value={addressFormData.name}
                            onChange={(e) => setAddressFormData({ ...addressFormData, name: e.target.value })}
                            required
                          />
                        </div>
                        {formErrors.name && <span className="checkout-field-error">{formErrors.name}</span>}
                      </div>

                      <div className="checkout-input-group">
                        <label className="checkout-input-label">
                          Phone Number <span style={{ color: '#D32F2F' }}>*</span>
                        </label>
                        <div className="checkout-input-wrapper">
                          <Phone size={18} className="checkout-input-icon" />
                          <input
                            type="tel"
                            className={`checkout-input ${formErrors.phone ? 'error' : ''}`}
                            placeholder="10-digit mobile number"
                            value={addressFormData.phone}
                            onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                            required
                          />
                        </div>
                        {formErrors.phone && <span className="checkout-field-error">{formErrors.phone}</span>}
                      </div>
                    </div>

                    <div className="checkout-input-group">
                      <label className="checkout-input-label">
                        Address Line 1 <span style={{ color: '#D32F2F' }}>*</span>
                      </label>
                      <div className="checkout-input-wrapper">
                        <Home size={18} className="checkout-input-icon" />
                        <input
                          type="text"
                          className={`checkout-input ${formErrors.street ? 'error' : ''}`}
                          placeholder="Flat / House No., Building, Street Name"
                          value={addressFormData.street}
                          onChange={(e) => setAddressFormData({ ...addressFormData, street: e.target.value })}
                          required
                        />
                      </div>
                      {formErrors.street && <span className="checkout-field-error">{formErrors.street}</span>}
                    </div>

                    <div className="checkout-input-group">
                      <label className="checkout-input-label">Address Line 2 (Optional)</label>
                      <div className="checkout-input-wrapper">
                        <Building size={18} className="checkout-input-icon" />
                        <input
                          type="text"
                          className="checkout-input"
                          placeholder="Apartment, suite, landmark, unit, etc."
                          value={addressFormData.address2}
                          onChange={(e) => setAddressFormData({ ...addressFormData, address2: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="checkout-form-row">
                      <div className="checkout-input-group">
                        <label className="checkout-input-label">
                          City <span style={{ color: '#D32F2F' }}>*</span>
                        </label>
                        <div className="checkout-input-wrapper">
                          <Building size={18} className="checkout-input-icon" />
                          <input
                            type="text"
                            className={`checkout-input ${formErrors.city ? 'error' : ''}`}
                            placeholder="City / Town"
                            value={addressFormData.city}
                            onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                            required
                          />
                        </div>
                        {formErrors.city && <span className="checkout-field-error">{formErrors.city}</span>}
                      </div>

                      <div className="checkout-input-group">
                        <label className="checkout-input-label">
                          State <span style={{ color: '#D32F2F' }}>*</span>
                        </label>
                        <div className="checkout-input-wrapper">
                          <MapPin size={18} className="checkout-input-icon" />
                          <select
                            className="checkout-select"
                            value={addressFormData.state}
                            onChange={(e) => setAddressFormData({ ...addressFormData, state: e.target.value })}
                            required
                          >
                            {INDIAN_STATES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    <div className="checkout-form-row">
                      <div className="checkout-input-group">
                        <label className="checkout-input-label">
                          PIN Code <span style={{ color: '#D32F2F' }}>*</span>
                        </label>
                        <div className="checkout-input-wrapper">
                          <MapPin size={18} className="checkout-input-icon" />
                          <input
                            type="text"
                            className={`checkout-input ${formErrors.postalCode ? 'error' : ''}`}
                            placeholder="6-digit PIN code"
                            maxLength={6}
                            value={addressFormData.postalCode}
                            onChange={(e) => setAddressFormData({ ...addressFormData, postalCode: e.target.value })}
                            required
                          />
                        </div>
                        {formErrors.postalCode && <span className="checkout-field-error">{formErrors.postalCode}</span>}
                      </div>

                      <div className="checkout-input-group">
                        <label className="checkout-input-label">Country</label>
                        <div className="checkout-input-wrapper">
                          <Globe size={18} className="checkout-input-icon" />
                          <input
                            type="text"
                            className="checkout-input"
                            value="India"
                            disabled
                            style={{ backgroundColor: '#F8F9F8', cursor: 'not-allowed' }}
                          />
                        </div>
                      </div>
                    </div>

                    <label className="checkout-checkbox-label">
                      <input
                        type="checkbox"
                        checked={addressFormData.saveForFuture}
                        onChange={(e) => setAddressFormData({ ...addressFormData, saveForFuture: e.target.checked })}
                      />
                      <span>Save this address for future orders</span>
                    </label>
                  </form>
                )}

                {/* Account Section Context Card */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  padding: '1rem 1.15rem',
                  backgroundColor: isLoggedIn ? '#EAF3ED' : '#F7F5EE',
                  border: isLoggedIn ? '1px solid #C4DFC8' : '1px solid #E6DED0',
                  borderRadius: '12px',
                  marginTop: '1.25rem',
                  marginBottom: '1.25rem',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      backgroundColor: isLoggedIn ? '#1E3A2B' : '#E8E2D4',
                      color: isLoggedIn ? '#FFFFFF' : '#1E3A2B',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <User size={18} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#1E3A2B' }}>
                        {isLoggedIn
                          ? `Signed in as ${customer?.name || customer?.email}`
                          : 'EarthLife Co. Account'}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: '#5A6B61', marginTop: '2px' }}>
                        {isLoggedIn
                          ? 'Ecwid customer authenticated. Ready for Shopping Cart & Razorpay Checkout.'
                          : 'Have an account? Sign in with your email & access code in the Account section.'}
                      </div>
                    </div>
                  </div>

                  <Link
                    to="/account?redirect=checkout"
                    id="checkout-account-section-link"
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      color: '#1E3A2B',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      textDecoration: 'none',
                      padding: '0.5rem 0.85rem',
                      borderRadius: '8px',
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #D1C7B7',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
                    }}
                  >
                    <span>{isLoggedIn ? 'Account Details' : 'Go to Account Section'}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>

                {/* Continue to Payment CTA Button */}
                {formErrors.address && (
                  <div className="checkout-field-error" style={{ marginBottom: '1rem', display: 'block', fontSize: '0.9rem' }}>
                    {formErrors.address}
                  </div>
                )}
                <button
                  type="button"
                  className="checkout-continue-btn"
                  onClick={handleContinueToPayment}
                  id="continue-to-payment-btn"
                  disabled={isSyncingCart}
                >
                  <span>
                    {isSyncingCart
                      ? 'Preparing Checkout...'
                      : isLoggedIn
                        ? 'Continue to Payment'
                        : 'Continue to Payment (Sign In in Account)'}
                  </span>
                  <ArrowRight size={18} />
                </button>
              </section>
            </div>

            {/* Right Column: Order Summary */}
            <aside className="checkout-summary-card" aria-label="Order Summary">
              <div className="checkout-summary-header">
                <h2 className="checkout-summary-title">Order Summary</h2>
                <Link to="/cart" className="checkout-edit-cart-link">
                  Edit Cart
                </Link>
              </div>
              <p className="checkout-summary-item-count">
                {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
              </p>

              {/* Items List */}
              <div className="checkout-summary-items-list">
                {cartItems.map((item) => {
                  const unitPrice = Number(item.price || 0);
                  const qty = Math.max(1, Number(item.quantity || 1));
                  const lineTotal = unitPrice * qty;

                  return (
                    <div className="checkout-summary-item" key={item.itemKey || item.id}>
                      <div className="checkout-summary-item-thumb">
                        <img src={item.image || ''} alt={item.name} loading="lazy" />
                      </div>

                      <div className="checkout-summary-item-details">
                        <div className="checkout-summary-item-name" title={item.name}>
                          {item.name}
                        </div>
                        <div className="checkout-summary-item-sub">
                          {item.category || 'Eco Essential'}
                          {item.options && Object.keys(item.options).length > 0 && (
                            <span> • {Object.values(item.options).join(', ')}</span>
                          )}
                        </div>
                      </div>

                      <div className="checkout-summary-item-pricing">
                        <span className="checkout-summary-item-price">{formatPrice(lineTotal)}</span>
                        <span className="checkout-summary-item-qty">Qty: {qty}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Calculations Breakdown */}
              <div className="checkout-summary-rows">
                <div className="checkout-summary-row">
                  <span>Subtotal</span>
                  <span>{formatPrice(cartTotals.subtotal)}</span>
                </div>

                <div className="checkout-summary-row">
                  <span>Shipping</span>
                  <span>
                    {cartTotals.shipping > 0 ? (
                      formatPrice(cartTotals.shipping)
                    ) : (
                      <span className="checkout-free-shipping-tag">FREE</span>
                    )}
                  </span>
                </div>

                {cartTotals.discount > 0 && (
                  <div className="checkout-summary-row discount">
                    <span>Discount</span>
                    <span>- {formatPrice(cartTotals.discount)}</span>
                  </div>
                )}

                {cartTotals.tax > 0 && (
                  <div className="checkout-summary-row tax">
                    <span>Estimated Tax (GST)</span>
                    <span>{formatPrice(cartTotals.tax)}</span>
                  </div>
                )}
              </div>

              {/* Grand Total */}
              <div className="checkout-summary-total-row">
                <span className="checkout-total-label">Total</span>
                <span className="checkout-total-val" id="checkout-grand-total">
                  {loadingTotals ? '...' : formatPrice(cartTotals.total || cartTotals.subtotal)}
                </span>
              </div>

              <div className="checkout-tax-note">
                (Calculated with live Ecwid store rates)
              </div>

              <div className="checkout-trust-badges">
                <div className="checkout-trust-badge">
                  <ShieldCheck size={20} />
                  <span>100% Secure</span>
                </div>
                <div className="checkout-trust-badge">
                  <Truck size={20} />
                  <span>Made in India</span>
                </div>
                <div className="checkout-trust-badge">
                  <RotateCcw size={20} />
                  <span>Easy Returns</span>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>

      {/* 3. Modal: Add / Edit Address */}
      {modalOpen && (
        <div className="checkout-modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="checkout-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="checkout-modal-header">
              <div>
                <h3 className="checkout-modal-title">
                  {editingAddressId ? 'Edit Address' : 'Add New Address'}
                </h3>
                <p className="checkout-modal-subtitle">Enter your delivery address details below.</p>
              </div>
              <button
                type="button"
                className="checkout-modal-close-btn"
                onClick={() => setModalOpen(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveModalAddress}>
              <div className="checkout-modal-form">
                <div className="checkout-form-row">
                  <div className="checkout-input-group">
                    <label className="checkout-input-label">
                      Full Name <span style={{ color: '#D32F2F' }}>*</span>
                    </label>
                    <div className="checkout-input-wrapper">
                      <User size={18} className="checkout-input-icon" />
                      <input
                        type="text"
                        className={`checkout-input ${formErrors.name ? 'error' : ''}`}
                        placeholder="Full legal name"
                        value={addressFormData.name}
                        onChange={(e) => setAddressFormData({ ...addressFormData, name: e.target.value })}
                        required
                      />
                    </div>
                    {formErrors.name && <span className="checkout-field-error">{formErrors.name}</span>}
                  </div>

                  <div className="checkout-input-group">
                    <label className="checkout-input-label">
                      Phone Number <span style={{ color: '#D32F2F' }}>*</span>
                    </label>
                    <div className="checkout-input-wrapper">
                      <Phone size={18} className="checkout-input-icon" />
                      <input
                        type="tel"
                        className={`checkout-input ${formErrors.phone ? 'error' : ''}`}
                        placeholder="10-digit mobile number"
                        value={addressFormData.phone}
                        onChange={(e) => setAddressFormData({ ...addressFormData, phone: e.target.value })}
                        required
                      />
                    </div>
                    {formErrors.phone && <span className="checkout-field-error">{formErrors.phone}</span>}
                  </div>
                </div>

                <div className="checkout-input-group">
                  <label className="checkout-input-label">
                    Address Line 1 <span style={{ color: '#D32F2F' }}>*</span>
                  </label>
                  <div className="checkout-input-wrapper">
                    <Home size={18} className="checkout-input-icon" />
                    <input
                      type="text"
                      className={`checkout-input ${formErrors.street ? 'error' : ''}`}
                      placeholder="Flat / House No., Building, Street Name"
                      value={addressFormData.street}
                      onChange={(e) => setAddressFormData({ ...addressFormData, street: e.target.value })}
                      required
                    />
                  </div>
                  {formErrors.street && <span className="checkout-field-error">{formErrors.street}</span>}
                </div>

                <div className="checkout-input-group">
                  <label className="checkout-input-label">Address Line 2 (Optional)</label>
                  <div className="checkout-input-wrapper">
                    <Building size={18} className="checkout-input-icon" />
                    <input
                      type="text"
                      className="checkout-input"
                      placeholder="Apartment, suite, landmark, unit, etc."
                      value={addressFormData.address2}
                      onChange={(e) => setAddressFormData({ ...addressFormData, address2: e.target.value })}
                    />
                  </div>
                </div>

                <div className="checkout-form-row">
                  <div className="checkout-input-group">
                    <label className="checkout-input-label">
                      City <span style={{ color: '#D32F2F' }}>*</span>
                    </label>
                    <div className="checkout-input-wrapper">
                      <Building size={18} className="checkout-input-icon" />
                      <input
                        type="text"
                        className={`checkout-input ${formErrors.city ? 'error' : ''}`}
                        placeholder="City / Town"
                        value={addressFormData.city}
                        onChange={(e) => setAddressFormData({ ...addressFormData, city: e.target.value })}
                        required
                      />
                    </div>
                    {formErrors.city && <span className="checkout-field-error">{formErrors.city}</span>}
                  </div>

                  <div className="checkout-input-group">
                    <label className="checkout-input-label">
                      State <span style={{ color: '#D32F2F' }}>*</span>
                    </label>
                    <div className="checkout-input-wrapper">
                      <MapPin size={18} className="checkout-input-icon" />
                      <select
                        className="checkout-select"
                        value={addressFormData.state}
                        onChange={(e) => setAddressFormData({ ...addressFormData, state: e.target.value })}
                        required
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="checkout-form-row">
                  <div className="checkout-input-group">
                    <label className="checkout-input-label">
                      PIN Code <span style={{ color: '#D32F2F' }}>*</span>
                    </label>
                    <div className="checkout-input-wrapper">
                      <MapPin size={18} className="checkout-input-icon" />
                      <input
                        type="text"
                        className={`checkout-input ${formErrors.postalCode ? 'error' : ''}`}
                        placeholder="6-digit PIN code"
                        maxLength={6}
                        value={addressFormData.postalCode}
                        onChange={(e) => setAddressFormData({ ...addressFormData, postalCode: e.target.value })}
                        required
                      />
                    </div>
                    {formErrors.postalCode && <span className="checkout-field-error">{formErrors.postalCode}</span>}
                  </div>

                  <div className="checkout-input-group">
                    <label className="checkout-input-label">Country</label>
                    <div className="checkout-input-wrapper">
                      <Globe size={18} className="checkout-input-icon" />
                      <input
                        type="text"
                        className="checkout-input"
                        value="India"
                        disabled
                        style={{ backgroundColor: '#F8F9F8', cursor: 'not-allowed' }}
                      />
                    </div>
                  </div>
                </div>

                <label className="checkout-checkbox-label">
                  <input
                    type="checkbox"
                    checked={addressFormData.saveForFuture}
                    onChange={(e) => setAddressFormData({ ...addressFormData, saveForFuture: e.target.checked })}
                  />
                  <span>Save this address for future orders</span>
                </label>
              </div>

              <div className="checkout-modal-footer">
                <button
                  type="button"
                  className="checkout-modal-cancel-btn"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="checkout-modal-save-btn">
                  {editingAddressId ? 'Update Address' : 'Save Address'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
