import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Minus, 
  Maximize2, 
  ShoppingBag, 
  Check, 
  X,
  ArrowRight
} from 'lucide-react';
import Container from '../../components/UI/Container/Container';
import { useEcwidProduct, useEcwidProducts } from '../../hooks/useEcwidProducts';
import LoadingState from '../../components/LoadingState/LoadingState';
import ErrorState from '../../components/ErrorState/ErrorState';
import { useCart } from '../../context/CartContext';
import './ProductDetails.css';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  // Load live product data from Ecwid
  const { product, loading, error, refetch } = useEcwidProduct(id);
  const { products: allEcwidProducts } = useEcwidProducts();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [isZoomModalOpen, setIsZoomModalOpen] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Reset state and scroll on product change
  useEffect(() => {
    setSelectedImageIndex(0);
    setQuantity(1);
    setSelectedOptions({});
    window.scrollTo(0, 0);
  }, [id]);

  // Initialize product options if present in Ecwid data
  useEffect(() => {
    if (product && Array.isArray(product.options) && product.options.length > 0) {
      const initial = {};
      product.options.forEach((opt) => {
        if (Array.isArray(opt.choices) && opt.choices.length > 0) {
          initial[opt.name] = opt.choices[0].text;
        }
      });
      setSelectedOptions(initial);
    }
  }, [product]);

  // Related products from live Ecwid catalog
  const relatedProducts = useMemo(() => {
    if (!allEcwidProducts || allEcwidProducts.length === 0) return [];
    const currentId = product ? product.id : null;
    return allEcwidProducts.filter((p) => p.id !== currentId).slice(0, 4);
  }, [allEcwidProducts, product]);

  // Gallery array
  const gallery = useMemo(() => {
    if (!product) return [];
    if (Array.isArray(product.gallery) && product.gallery.length > 0) {
      return product.gallery;
    }
    return product.image ? [product.image] : [];
  }, [product]);

  const currentImage = gallery[selectedImageIndex] || product?.image || '';

  // Stock availability
  const isOutOfStock = Boolean(product && !product.inStock);
  const maxStock = (product && !product.unlimited && typeof product.quantity === 'number')
    ? product.quantity
    : 99;

  // Gallery Navigation Handlers
  const handlePrevImage = () => {
    setSelectedImageIndex((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImageIndex((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  };

  // Cart & Buy Now Handlers
  const handleAddToCart = () => {
    if (!product || isOutOfStock) return;
    addToCart(product, quantity, selectedOptions);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleBuyNow = () => {
    if (!product || isOutOfStock) return;
    addToCart(product, quantity, selectedOptions);
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="product-details-page">
        <Container className="pd-main-container">
          <LoadingState message="Loading live product details from Ecwid..." />
        </Container>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-details-page">
        <Container className="pd-main-container">
          <ErrorState 
            title="Product Not Found" 
            message={error || "We couldn't find the product you're looking for in the live Ecwid catalog."} 
            onRetry={refetch} 
          />
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <Link to="/store" className="return-store-btn">
              Return to Store
            </Link>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="product-details-page">
      {/* Breadcrumb Bar */}
      <div className="pd-breadcrumb-bar">
        <Container>
          <nav className="pd-breadcrumbs" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <span className="pd-breadcrumb-sep">&gt;</span>
            <Link to="/store">Store</Link>
            {product.categoryType && (
              <>
                <span className="pd-breadcrumb-sep">&gt;</span>
                <Link to={`/store?category=${product.categoryType}`}>
                  {product.categoryName || 'Products'}
                </Link>
              </>
            )}
            <span className="pd-breadcrumb-sep">&gt;</span>
            <span className="pd-breadcrumb-current">{product.name}</span>
          </nav>
        </Container>
      </div>

      {/* Main Showcase Section */}
      <Container className="pd-main-container">
        <div className="pd-layout-grid">
          {/* Left Column: Gallery with vertical thumbnails and main stage */}
          <div className="pd-gallery-column">
            {/* Left Vertical Thumbnail Strip */}
            {gallery.length > 1 && (
              <div className="pd-thumbnail-strip" role="tablist" aria-label="Product thumbnails">
                {gallery.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    role="tab"
                    aria-selected={selectedImageIndex === idx}
                    className={`pd-thumb-btn ${selectedImageIndex === idx ? 'active' : ''}`}
                    onClick={() => setSelectedImageIndex(idx)}
                    aria-label={`View photo ${idx + 1}`}
                  >
                    <img src={imgUrl} alt={`${product.name} thumbnail ${idx + 1}`} />
                  </button>
                ))}
              </div>
            )}

            {/* Main Stage */}
            <div className="pd-main-stage">
              <img
                src={currentImage}
                alt={product.name}
                className="pd-stage-image"
              />

              {/* Prev / Next Carousel Arrows */}
              {gallery.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="pd-stage-arrow left"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="pd-stage-arrow right"
                    aria-label="Next image"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}

              {/* Expand / Fullscreen Button */}
              <button
                type="button"
                onClick={() => setIsZoomModalOpen(true)}
                className="pd-stage-expand-btn"
                aria-label="Expand image"
              >
                <Maximize2 size={16} />
              </button>
            </div>
          </div>

          {/* Right Column: Product Info & Purchase Controls */}
          <div className="pd-info-column">
            {/* Category Pill */}
            {product.categoryTag && (
              <div className="pd-category-pill">{product.categoryTag}</div>
            )}

            {/* Title */}
            <h1 className="pd-title">{product.name}</h1>

            {/* Price Row & Tax Note */}
            <div className="pd-price-row">
              <span className="pd-price">₹{product.price}</span>
              {product.compareToPrice && (
                <span className="pd-compare-price">₹{product.compareToPrice}</span>
              )}
              {product.discountPercent && (
                <span className="pd-discount-badge">{product.discountPercent}% OFF</span>
              )}
            </div>
            <div className="pd-tax-note">Inclusive of all taxes</div>

            {/* Live Ecwid Product Options (e.g. Swatches, Colors, Sizes) */}
            {Array.isArray(product.options) && product.options.length > 0 && (
              <div className="pd-options-section">
                {product.options.map((opt, optIdx) => (
                  <div key={optIdx} className="pd-option-block">
                    <div className="pd-option-label">
                      {opt.name}:
                      <span>{selectedOptions[opt.name] || 'Select'}</span>
                    </div>

                    <div className="pd-swatches-row">
                      {Array.isArray(opt.choices) && opt.choices.map((choice, choiceIdx) => {
                        const isSelected = selectedOptions[opt.name] === choice.text;
                        const hexCode = Array.isArray(choice.hexCodes) && choice.hexCodes[0] 
                          ? choice.hexCodes[0] 
                          : null;

                        return (
                          <button
                            key={choiceIdx}
                            type="button"
                            className={`pd-swatch-item ${isSelected ? 'active' : ''}`}
                            onClick={() => setSelectedOptions(prev => ({ ...prev, [opt.name]: choice.text }))}
                          >
                            {hexCode && (
                              <span 
                                className="pd-swatch-color" 
                                style={{ backgroundColor: hexCode }} 
                                aria-hidden="true"
                              />
                            )}
                            <span>{choice.text}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Real Ecwid Product Description & Specifications Card */}
            <div className="pd-ecwid-details-card">
              <h3 className="pd-section-heading">About This Product</h3>

              {/* Real Ecwid HTML Description */}
              {product.description ? (
                <div 
                  className="pd-ecwid-description" 
                  dangerouslySetInnerHTML={{ __html: product.description }} 
                />
              ) : (
                <p className="pd-short-desc">Natural handcrafted essential from EarthLife Co.</p>
              )}

              {/* Real Ecwid Specifications Grid */}
              <div className="pd-specs-grid" style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid #ECE4D8' }}>
                {product.sku && (
                  <div className="pd-spec-item">
                    <span className="pd-spec-label">SKU:</span>
                    <span className="pd-spec-val">{product.sku}</span>
                  </div>
                )}
                {product.weight && (
                  <div className="pd-spec-item">
                    <span className="pd-spec-label">Weight:</span>
                    <span className="pd-spec-val">{product.weight} kg</span>
                  </div>
                )}
                <div className="pd-spec-item">
                  <span className="pd-spec-label">Availability:</span>
                  <span className={`pd-spec-val ${product.inStock ? 'in-stock' : 'out-of-stock'}`}>
                    {product.inStock 
                      ? (product.unlimited 
                          ? 'In Stock' 
                          : `In Stock (${typeof product.quantity === 'number' ? product.quantity : 1} items)`)
                      : 'Out of Stock'}
                  </span>
                </div>
                {product.categoryName && (
                  <div className="pd-spec-item">
                    <span className="pd-spec-label">Category:</span>
                    <span className="pd-spec-val">{product.categoryName}</span>
                  </div>
                )}
                {/* Real Ecwid Attributes (e.g. Brand) */}
                {Array.isArray(product.attributes) && product.attributes.map((attr, idx) => (
                  <div key={idx} className="pd-spec-item">
                    <span className="pd-spec-label">{attr.name}:</span>
                    <span className="pd-spec-val">{attr.value}</span>
                  </div>
                ))}
              </div>

              <div className="pd-shipping-note">
                <span>🚚 Free Delivery on orders above ₹299 • 100% Secure Payments • Dispatched in 24–48h</span>
              </div>
            </div>

            {/* Quantity Stepper & Purchase Actions (Immediately below Description) */}
            <div className="pd-purchase-actions">
              <div className="pd-quantity-row">
                <div className="pd-quantity-stepper">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    aria-label="Decrease quantity"
                    className="pd-qty-btn"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="pd-qty-val">{quantity}</span>
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.min(maxStock, prev + 1))}
                    disabled={quantity >= maxStock || isOutOfStock}
                    aria-label="Increase quantity"
                    className="pd-qty-btn"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <button
                  type="button"
                  className={`pd-add-cart-btn ${addedAnimation ? 'added' : ''}`}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  id="pd-add-cart-button"
                >
                  {isOutOfStock ? (
                    <span>Out of Stock</span>
                  ) : addedAnimation ? (
                    <>
                      <Check size={18} />
                      <span>Added to Cart!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      <span>Add to Cart</span>
                    </>
                  )}
                </button>
              </div>

              {/* Buy Now Button */}
              <button
                type="button"
                className="pd-buy-now-btn"
                onClick={handleBuyNow}
                disabled={isOutOfStock}
                id="pd-buy-now-button"
              >
                {isOutOfStock ? 'Currently Unavailable' : 'Buy Now'}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: You May Also Like (Real Ecwid Catalog) */}
        {relatedProducts.length > 0 && (
          <section className="pd-related-section" aria-label="Related Products">
            <div className="pd-related-header">
              <h2 className="pd-related-title">You May Also Like</h2>
              <p className="pd-related-subtitle">More natural essentials for a greener everyday life.</p>
            </div>

            <div className="pd-related-grid">
              {relatedProducts.map((relProduct) => {
                return (
                  <div
                    key={relProduct.id}
                    className="pd-related-card"
                    onClick={() => navigate(`/product/${relProduct.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        navigate(`/product/${relProduct.id}`);
                      }
                    }}
                  >
                    <div className="related-img-box">
                      <img
                        src={relProduct.image}
                        alt={relProduct.name}
                        className="related-product-img"
                        loading="lazy"
                      />
                    </div>

                    <div className="related-card-body">
                      <h3 className="related-name">{relProduct.name}</h3>
                      <div className="related-price">₹{relProduct.price}</div>
                    </div>

                    <button
                      type="button"
                      className="related-view-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${relProduct.id}`);
                      }}
                    >
                      <span>View Product</span>
                      <ArrowRight size={14} style={{ marginLeft: '4px' }} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </Container>

      {/* Image Zoom Modal */}
      {isZoomModalOpen && (
        <div 
          className="pd-zoom-modal-overlay" 
          onClick={() => setIsZoomModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="pd-zoom-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="pd-zoom-close-btn"
              onClick={() => setIsZoomModalOpen(false)}
              aria-label="Close zoomed image"
            >
              <X size={24} />
            </button>
            <img src={currentImage} alt={product.name} className="pd-zoomed-img" />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;
