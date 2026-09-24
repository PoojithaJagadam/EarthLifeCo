import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useEcwidOrders } from '../../hooks/useEcwidOrders';
import { addProductToEcwidCart } from '../../ecwid/cart/ecwidCart';
import { ChevronDown, ChevronUp, RotateCcw, AlertTriangle, CheckCircle, Package } from 'lucide-react';
import HelpfulCrowdWidget from '../../integrations/helpfulcrowd/HelpfulCrowdWidget';
import './Orders.css';

export default function Orders() {
  const { customerEmail } = useCart();
  const { orders, loading, error } = useEcwidOrders(customerEmail);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [reorderingOrderId, setReorderingOrderId] = useState(null);
  const [reorderFeedback, setReorderFeedback] = useState(null);

  // Toggle order details expansion
  const handleToggleDetails = (orderId) => {
    // If clicking the currently expanded order, collapse it (null)
    // If clicking a collapsed order, expand only that order and collapse all others
    setExpandedOrderId(prevId => (prevId === orderId ? null : orderId));
  };

  // Supported Ecwid repeat-order / Buy Again functionality
  const handleBuyAgain = async (order) => {
    if (!order) return;
    setReorderingOrderId(order.id);
    setReorderFeedback(null);

    try {
      // 1. First attempt native Ecwid repeat-order navigation
      if (typeof window !== 'undefined' && window.Ecwid && typeof window.Ecwid.openPage === 'function') {
        try {
          window.Ecwid.openPage('repeat-order', { id: order.id, type: 'order' });
          setReorderFeedback({ orderId: order.id, success: true, message: 'Opening checkout with previous order items...' });
          setReorderingOrderId(null);
          return;
        } catch (nativeErr) {
          console.warn('Native Ecwid repeat-order openPage fallback:', nativeErr);
        }
      }

      // 2. Add each item from the order to Ecwid cart session
      if (order.items && order.items.length > 0) {
        for (const item of order.items) {
          const productPayload = {
            id: item.productId || item.id,
            name: item.name,
            price: item.price,
            originalPrice: item.price,
            image: item.imageUrl || item.smallThumbnailUrl || '',
            sku: item.sku || '',
            quantity: Math.max(1, Number(item.quantity || 1))
          };
          await addProductToEcwidCart(
            productPayload,
            Math.max(1, Number(item.quantity || 1)),
            item.selectedOptions || item.options || {}
          );
        }

        setReorderFeedback({ orderId: order.id, success: true, message: 'All items added to cart! Proceeding to cart...' });

        // Navigate directly into Ecwid cart / checkout flow (never product page)
        setTimeout(() => {
          if (typeof window !== 'undefined' && window.Ecwid && typeof window.Ecwid.openPage === 'function') {
            window.Ecwid.openPage('cart');
          } else {
            window.location.href = '/cart';
          }
        }, 500);
      } else {
        // Direct to cart as fallback
        if (typeof window !== 'undefined' && window.Ecwid && typeof window.Ecwid.openPage === 'function') {
          window.Ecwid.openPage('cart');
        } else {
          window.location.href = '/cart';
        }
      }
    } catch (err) {
      console.error('Error executing Buy Again repeat order:', err);
      setReorderFeedback({ orderId: order.id, success: false, message: 'Could not repeat order. Please try from cart.' });
    } finally {
      setReorderingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="orders-page">
        <div className="orders-status-box">
          <p>Loading your Ecwid order history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-page">
        <div className="orders-status-box orders-error-box">
          <AlertTriangle size={20} />
          <p>Error loading orders: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-header">
        <h1>My Orders</h1>
        <p>Track, manage and review your purchases directly from your Ecwid account.</p>
      </div>

      {(!orders || orders.length === 0) ? (
        <div className="orders-empty-state">
          <Package size={48} className="orders-empty-icon" />
          <h3>No Orders Found</h3>
          <p>You haven't placed any orders yet. Explore our sustainable bamboo and natural products.</p>
          <a href="/store" className="orders-cta-btn">Start Shopping</a>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const isReordering = reorderingOrderId === order.id;
            const feedback = reorderFeedback?.orderId === order.id ? reorderFeedback : null;
            const formattedDate = order.createDate 
              ? new Date(order.createDate).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })
              : 'Recent Order';
            const totalFormatted = typeof order.total === 'number' 
              ? `₹${order.total.toFixed(2)}` 
              : `₹${order.usdTotal || order.subtotal || 0}`;

            return (
              <div 
                key={order.id} 
                className={`order-card ${isExpanded ? 'order-card--expanded' : 'order-card--collapsed'}`}
              >
                {/* Compact Order Header */}
                <div className="order-card-header">
                  <div className="order-meta-info">
                    <span className="order-number">Order #{order.id}</span>
                    <span className="order-date">Placed on {formattedDate}</span>
                  </div>
                  <div className="order-header-right">
                    <span className={`order-status-badge status-${(order.fulfillmentStatus || 'processing').toLowerCase()}`}>
                      {order.fulfillmentStatus || 'PROCESSING'}
                    </span>
                    <span className="order-header-total">{totalFormatted}</span>
                  </div>
                </div>

                {/* Compact Item Preview (visible in both states) */}
                <div className="order-items-preview">
                  {order.items && order.items.length > 0 ? (
                    <div className="order-preview-item">
                      <span className="item-name">
                        {order.items[0].name}
                        {order.items[0].quantity > 1 ? ` × ${order.items[0].quantity}` : ''}
                      </span>
                      {order.items.length > 1 && (
                        <span className="item-more-tag">+{order.items.length - 1} more item{order.items.length > 2 ? 's' : ''}</span>
                      )}
                    </div>
                  ) : (
                    <div className="order-preview-item">
                      <span className="item-name">Order items</span>
                    </div>
                  )}
                </div>

                {/* Reorder feedback notice */}
                {feedback && (
                  <div className={`order-feedback-notice ${feedback.success ? 'feedback-success' : 'feedback-error'}`}>
                    {feedback.success ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                    <span>{feedback.message}</span>
                  </div>
                )}

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="order-expanded-details">
                    <h4 className="details-heading">Order Items</h4>
                    <div className="expanded-items-list">
                      {order.items && order.items.map((item, idx) => (
                        <div key={item.id || idx} className="expanded-item-row">
                          <div className="expanded-item-info">
                            <span className="expanded-item-name">{item.name}</span>
                            <span className="expanded-item-qty">Qty: {item.quantity || 1}</span>
                            {item.sku && <span className="expanded-item-sku">SKU: {item.sku}</span>}
                            <div style={{ marginTop: '0.5rem' }}>
                              <Link 
                                to={`/product/${item.productId || item.id}#write-review`}
                                className="order-action-btn"
                                style={{ display: 'inline-block', fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#f9f9f9', border: '1px solid #ddd', borderRadius: '4px', color: '#1E3A2B', textDecoration: 'none' }}
                              >
                                Write a Review
                              </Link>
                            </div>
                          </div>
                          <span className="expanded-item-price">
                            ₹{(Number(item.price || 0) * (item.quantity || 1)).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Shipping & Delivery Info if present */}
                    {order.shippingPerson && (
                      <div className="order-shipping-details">
                        <h4 className="details-heading">Delivery Address</h4>
                        <p className="shipping-text">
                          <strong>{order.shippingPerson.name}</strong><br />
                          {order.shippingPerson.street}<br />
                          {order.shippingPerson.city}, {order.shippingPerson.stateOrProvinceCode} - {order.shippingPerson.postalCode}<br />
                          {order.shippingPerson.countryName || 'India'}
                        </p>
                      </div>
                    )}

                    {/* Order Financial Breakdown */}
                    <div className="order-totals-breakdown">
                      <div className="breakdown-row">
                        <span>Subtotal:</span>
                        <span>₹{Number(order.subtotal || order.total || 0).toFixed(2)}</span>
                      </div>
                      {typeof order.shippingCost === 'number' && order.shippingCost > 0 && (
                        <div className="breakdown-row">
                          <span>Shipping:</span>
                          <span>₹{order.shippingCost.toFixed(2)}</span>
                        </div>
                      )}
                      {typeof order.tax === 'number' && order.tax > 0 && (
                        <div className="breakdown-row">
                          <span>Tax:</span>
                          <span>₹{order.tax.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="breakdown-row breakdown-total">
                        <span>Grand Total:</span>
                        <span>{totalFormatted}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Bar */}
                <div className="order-actions-row">
                  {/* FIX 1: View Details / Hide Details Toggle */}
                  <button
                    type="button"
                    className="order-action-btn toggle-btn"
                    onClick={() => handleToggleDetails(order.id)}
                    aria-expanded={isExpanded}
                  >
                    <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>

                  {/* FIX 2: Buy Again - repeats previous order items into Ecwid cart/checkout flow */}
                  <button
                    type="button"
                    className="order-action-btn buy-again-btn"
                    onClick={() => handleBuyAgain(order)}
                    disabled={isReordering}
                  >
                    <RotateCcw size={15} className={isReordering ? 'spin-icon' : ''} />
                    <span>{isReordering ? 'Adding to Cart...' : 'Buy again'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* HelpfulCrowd Sidebar Widget */}
      <HelpfulCrowdWidget widgetType="sidebar" />
    </div>
  );
}
