import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  X, 
  Minus, 
  Plus, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  HelpCircle
} from 'lucide-react';
import Container from '../../components/UI/Container/Container';
import { useCart } from '../../context/CartContext';
import { useEcwidProducts } from '../../hooks/useEcwidProducts';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    cartCount,
    cartTotals,
    loadingTotals,
    appliedCoupon,
    updateQuantity,
    removeFromCart,
    clearCart
  } = useCart();

  // Fetch real Ecwid products for "You May Also Like"
  const { products: relatedProducts = [] } = useEcwidProducts({ limit: 12 });

  // Filter recommendations to exclude products already in the cart
  const recommendedProducts = useMemo(() => {
    const cartProductIds = new Set(cartItems.map((item) => Number(item.productId || item.id)));
    const filtered = relatedProducts.filter((p) => !cartProductIds.has(Number(p.id)));
    return (filtered.length >= 4 ? filtered : relatedProducts).slice(0, 4);
  }, [relatedProducts, cartItems]);

  const formatPrice = (val) => {
    const num = Number(val) || 0;
    return `₹${num.toLocaleString('en-IN')}`;
  };

  // Check if free shipping threshold is met
  const isFreeDelivery = cartTotals.subtotal >= 299 || cartTotals.shipping === 0;

  return (
    <div className="cart-page" id="earthlife-cart-page">
      {/* 1. Cart Hero Banner */}
      <section className="cart-hero">
        <svg className="cart-hero-leaf-left" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 0 C70 30 90 60 50 100 C10 60 30 30 50 0 Z" fill="#2C4A3B" />
        </svg>
        <svg className="cart-hero-leaf-right" viewBox="0 0 100 100" fill="currentColor">
          <path d="M50 0 C70 30 90 60 50 100 C10 60 30 30 50 0 Z" fill="#2C4A3B" />
        </svg>

        <div className="cart-hero-content">
          <h1 className="cart-hero-title">Your Cart</h1>
          <p className="cart-hero-subtitle">Sustainable choices for a brighter tomorrow.</p>
          <nav className="cart-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="cart-breadcrumbs-sep">/</span>
            <span className="cart-breadcrumbs-current">Your Cart</span>
          </nav>
        </div>
      </section>

      {/* 2. Main Content Area */}
      <Container className="cart-main-container">
        {cartItems.length === 0 ? (
          /* Empty Cart State */
          <div className="cart-empty-state" id="cart-empty-view">
            <div className="cart-empty-icon-wrap">
              <ShoppingBag size={38} strokeWidth={1.75} />
            </div>
            <h2 className="cart-empty-title">Your Cart is Empty</h2>
            <p className="cart-empty-text">
              Looks like you haven’t added any sustainable essentials to your cart yet. Explore our handcrafted neem, bamboo, and coconut coir collection.
            </p>
            <Link to="/store" className="cart-empty-action-btn" id="cart-empty-store-btn">
              <span>Explore Store</span>
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          /* Active Cart Layout */
          <div className="cart-layout-grid">
            {/* Left Column: Cart Table */}
            <div className="cart-table-wrapper">
              <div className="cart-table-head">
                <div className="cart-th-product">Product</div>
                <div className="cart-th-price">Price</div>
                <div className="cart-th-qty">Quantity</div>
                <div className="cart-th-subtotal">Subtotal</div>
              </div>

              <div className="cart-items-list" role="list">
                {cartItems.map((item) => {
                  const lineSubtotal = (Number(item.price) || 0) * (Number(item.quantity) || 1);
                  const optionEntries = item.options ? Object.entries(item.options) : [];

                  return (
                    <div className="cart-item-row" key={item.itemKey || item.id} role="listitem">
                      {/* Product details cell */}
                      <div className="cart-item-product-cell">
                        <button
                          type="button"
                          className="cart-item-remove-btn"
                          onClick={() => removeFromCart(item.itemKey || item.id)}
                          aria-label={`Remove ${item.name} from cart`}
                          title="Remove item"
                        >
                          <X size={16} />
                        </button>

                        <Link to={`/product/${item.productId || item.id}`} className="cart-item-image-box">
                          {item.image ? (
                            <img src={item.image} alt={item.name} loading="lazy" />
                          ) : (
                            <div style={{ color: '#A0ACA4', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                              <ShoppingBag size={24} />
                            </div>
                          )}
                        </Link>

                        <div className="cart-item-meta">
                          <Link to={`/product/${item.productId || item.id}`} className="cart-item-title">
                            {item.name}
                          </Link>

                          {/* Options / Variations Display */}
                          {optionEntries.length > 0 && (
                            <div className="cart-item-option-badge">
                              {optionEntries.map(([key, val]) => (
                                <span key={key}>
                                  <span className="cart-item-option-name">{key}: </span>
                                  <span className="cart-item-option-val">{String(val)}</span>
                                </span>
                              ))}
                            </div>
                          )}

                          {optionEntries.length === 0 && item.category && (
                            <div className="cart-item-option-badge">
                              <span className="cart-item-option-name">{item.category}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Price Cell */}
                      <div className="cart-item-price-cell">
                        <span>{formatPrice(item.price)}</span>
                      </div>

                      {/* Quantity Cell */}
                      <div className="cart-item-qty-cell">
                        <div className="cart-qty-stepper">
                          <button
                            type="button"
                            className="cart-qty-btn"
                            onClick={() => updateQuantity(item.itemKey || item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={13} />
                          </button>
                          <span className="cart-qty-val" aria-label={`Quantity: ${item.quantity}`}>
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            className="cart-qty-btn"
                            onClick={() => updateQuantity(item.itemKey || item.id, item.quantity + 1)}
                            aria-label="Increase quantity"
                          >
                            <Plus size={13} />
                          </button>
                        </div>
                      </div>

                      {/* Subtotal Cell */}
                      <div className="cart-item-subtotal-cell">
                        <span>{formatPrice(lineSubtotal)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Table Actions: Clear Cart */}
              <div className="cart-table-bottom" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Link to="/store" className="cart-continue-shopping-link" style={{ color: '#1E3A2B', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  ← Continue Shopping
                </Link>

                <button
                  type="button"
                  className="cart-clear-btn"
                  onClick={clearCart}
                  id="clear-cart-btn"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            {/* Right Column: Order Summary Card */}
            <aside className="cart-summary-card" aria-label="Order Summary">
              <h2 className="cart-summary-title">Order Summary</h2>

              <div className="cart-summary-rows">
                <div className="cart-summary-row">
                  <span className="cart-summary-label">Items ({cartCount})</span>
                  <span className="cart-summary-val">{formatPrice(cartTotals.subtotal)}</span>
                </div>

                <div className="cart-summary-row">
                  <span className="cart-summary-label">Subtotal</span>
                  <span className="cart-summary-val">{formatPrice(cartTotals.subtotal)}</span>
                </div>

                <div className="cart-summary-row">
                  <span className="cart-summary-label">
                    <span>Shipping</span>
                    <span 
                      className="cart-info-tooltip-btn" 
                      title="Free delivery on orders above ₹299"
                      aria-label="Shipping information"
                    >
                      <HelpCircle size={14} />
                    </span>
                  </span>
                  <span className={`cart-summary-val ${isFreeDelivery ? 'free' : ''}`}>
                    {isFreeDelivery ? 'Free' : formatPrice(cartTotals.shipping)}
                  </span>
                </div>

                {cartTotals.discount > 0 && (
                  <div className="cart-summary-row">
                    <span className="cart-summary-label">
                      Discount {appliedCoupon ? `(${appliedCoupon})` : ''}
                    </span>
                    <span className="cart-summary-val discount">
                      -{formatPrice(cartTotals.discount)}
                    </span>
                  </div>
                )}

                {cartTotals.tax > 0 && (
                  <div className="cart-summary-row">
                    <span className="cart-summary-label">Estimated Tax (India GST)</span>
                    <span className="cart-summary-val">{formatPrice(cartTotals.tax)}</span>
                  </div>
                )}

                <div className="cart-summary-divider" />

                <div className="cart-summary-total-row">
                  <span className="cart-total-label">Total</span>
                  <span className="cart-total-val" id="cart-grand-total">
                    {loadingTotals ? '...' : formatPrice(cartTotals.total || cartTotals.subtotal)}
                  </span>
                </div>

                <div className="cart-summary-tax-note">
                  (Includes taxes where applicable per live Ecwid rates)
                </div>
              </div>

              {/* Proceed to Checkout Button */}
              <button
                type="button"
                className="cart-checkout-btn"
                onClick={() => navigate('/checkout')}
                id="proceed-to-checkout-btn"
              >
                Proceed to Checkout
              </button>

              <div className="cart-trust-badges">
                <div className="cart-trust-item">
                  <ShieldCheck size={16} />
                  <span>100% Secure</span>
                </div>
                <div className="cart-trust-item">
                  <Truck size={16} />
                  <span>Made in India</span>
                </div>
                <div className="cart-trust-item">
                  <RotateCcw size={16} />
                  <span>Easy Support</span>
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* 3. "You May Also Like" Section with Real Ecwid Catalog Products */}
        {recommendedProducts.length > 0 && (
          <section className="cart-related-section" aria-label="Recommended Products">
            <h2 className="cart-related-title">You May Also Like</h2>

            <div className="cart-related-grid">
              {recommendedProducts.map((prod) => (
                <div className="cart-related-card" key={prod.id}>
                  <Link to={`/product/${prod.id}`} className="cart-related-img-wrap">
                    <img 
                      src={prod.image || (prod.gallery && prod.gallery[0]) || ''} 
                      alt={prod.name} 
                      loading="lazy" 
                    />
                  </Link>

                  <div className="cart-related-info">
                    <Link to={`/product/${prod.id}`} className="cart-related-name" title={prod.name}>
                      {prod.name}
                    </Link>

                    <div className="cart-related-price-row">
                      <span className="cart-related-price">{formatPrice(prod.price)}</span>
                      {prod.originalPrice > prod.price && (
                        <span className="cart-related-compare-price">{formatPrice(prod.originalPrice)}</span>
                      )}
                    </div>

                    <Link to={`/product/${prod.id}`} className="cart-related-btn">
                      View Product
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </Container>
    </div>
  );
};

export default Cart;
