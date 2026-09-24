import React, { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { 
  Leaf, 
  Sparkles, 
  RotateCw, 
  ArrowRight, 
  Truck, 
  Users, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';
import Container from '../../components/UI/Container/Container';
import Button from '../../components/UI/Button/Button';
import SectionHeading from '../../components/UI/SectionHeading/SectionHeading';
import heroLeafImg from '../../assets/hero_leaf_transparent.png';
import heroProductsMobileImg from '../../assets/hero_products_mobile.png';
import catNeemImg from '../../assets/cat_neem.png';
import catBambooImg from '../../assets/cat_bamboo.png';
import catCoconutImg from '../../assets/cat_coconut.png';
import sproutHandsImg from '../../assets/images/why_sprout_hands_1790188514691.jpg';
import { useEcwidProducts } from '../../hooks/useEcwidProducts';
import { useEcwidCategories } from '../../hooks/useEcwidCategories';
import LoadingState from '../../components/LoadingState/LoadingState';
import ErrorState from '../../components/ErrorState/ErrorState';
import EmptyState from '../../components/EmptyState/EmptyState';
import './Home.css';

const CATEGORY_BG_COLORS = ['#F6ECE1', '#EBF2EB', '#F7EFE7', '#F4ECE4'];

const Home = () => {
  const shouldReduceMotion = useReducedMotion();
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);

  // Live Ecwid Data Hooks
  const { 
    products: ecwidProducts, 
    loading: productsLoading, 
    error: productsError, 
    refetch: refetchProducts 
  } = useEcwidProducts();

  const { 
    categories: ecwidCategories, 
    loading: categoriesLoading, 
    error: categoriesError, 
    refetch: refetchCategories 
  } = useEcwidCategories();

  // Dynamic Featured / Bestselling Products from live Ecwid catalog
  const featuredProducts = useMemo(() => {
    if (!ecwidProducts || !Array.isArray(ecwidProducts) || ecwidProducts.length === 0) {
      return [];
    }

    // 1. Check if admin configured an Ecwid category for bestsellers or featured
    if (ecwidCategories && Array.isArray(ecwidCategories) && ecwidCategories.length > 0) {
      const bestsellerCategory = ecwidCategories.find(c => {
        const name = (c.name || '').toLowerCase();
        return name.includes('bestseller') || name.includes('featured') || name.includes('popular');
      });

      if (bestsellerCategory) {
        const catProducts = ecwidProducts.filter(p => 
          (Array.isArray(p.categoryIds) && p.categoryIds.includes(Number(bestsellerCategory.id))) ||
          String(p.categoryId) === String(bestsellerCategory.id)
        );
        if (catProducts.length > 0) {
          return catProducts;
        }
      }
    }

    // 2. Check for Ecwid native "Show on Store Frontpage" products (ordered by showOnFrontpage)
    const frontpageProducts = ecwidProducts
      .filter(p => p.showOnFrontpage !== null && p.showOnFrontpage !== undefined)
      .sort((a, b) => a.showOnFrontpage - b.showOnFrontpage);

    if (frontpageProducts.length > 0) {
      return frontpageProducts;
    }

    // 3. Fallback to all catalog products
    return ecwidProducts;
  }, [ecwidProducts, ecwidCategories]);

  // Carousel calculation
  const visibleCount = 4;
  const numSlides = Math.max(1, featuredProducts.length > visibleCount ? featuredProducts.length - visibleCount + 1 : 1);
  const safeSlide = Math.min(activeSlide, numSlides - 1);

  const displayedProducts = useMemo(() => {
    if (featuredProducts.length <= visibleCount) {
      return featuredProducts;
    }
    return featuredProducts.slice(safeSlide, safeSlide + visibleCount);
  }, [featuredProducts, safeSlide, visibleCount]);

  const nextSlide = () => {
    setActiveSlide(prev => (prev + 1) % numSlides);
  };

  const prevSlide = () => {
    setActiveSlide(prev => (prev - 1 + numSlides) % numSlides);
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Dynamic Categories from live Ecwid catalog
  const displayedCategories = useMemo(() => {
    if (!ecwidCategories || !Array.isArray(ecwidCategories) || ecwidCategories.length === 0) {
      return [];
    }

    return ecwidCategories.map((cat, idx) => {
      const name = cat.name || 'Category';
      const nameLower = name.toLowerCase();

      // Determine fallback image if Ecwid category has no image uploaded
      let fallbackImg = catNeemImg;
      if (nameLower.includes('bamboo')) fallbackImg = catBambooImg;
      else if (nameLower.includes('coconut')) fallbackImg = catCoconutImg;

      // Clean HTML description from Ecwid
      const subtitle = cat.description
        ? cat.description.replace(/<[^>]*>/g, '').trim()
        : 'Explore natural essentials';

      // Link to store with category filter
      let link = `/store?category=${cat.id}`;
      if (nameLower.includes('neem')) link = '/store?category=neem';
      else if (nameLower.includes('bamboo')) link = '/store?category=bamboo';
      else if (nameLower.includes('coconut')) link = '/store?category=coconut';

      return {
        id: cat.id,
        title: name,
        subtitle,
        image: cat.imageUrl || cat.thumbnailUrl || fallbackImg,
        bgColor: CATEGORY_BG_COLORS[idx % CATEGORY_BG_COLORS.length],
        link
      };
    });
  }, [ecwidCategories]);

  return (
    <div className="home-page">
      {/* Hero Section: Fitted background image with products seamlessly integrated */}
      <section className="hero" id="hero-section">
        {/* Subtle decorative leaf accent */}
        <img 
          src={heroLeafImg} 
          alt="" 
          aria-hidden="true" 
          className="hero-leaf-bg" 
        />

        <div className="hero-grid-container">
          {/* Left Column: Editorial Content */}
          <motion.div 
            className="hero-content"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <motion.p 
              className="hero-eyebrow"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              NATURAL EVERYDAY ESSENTIALS
            </motion.p>

            <motion.h1 
              className="hero-headline"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12 }}
            >
              Where Natural<br />
              <span className="hero-headline-accent">Materials Meet</span><br />
              Everyday Elegance.
            </motion.h1>

            <motion.p 
              className="hero-desc"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Premium everyday essentials crafted from Neem wood, bamboo and coconut coir. 
              Thoughtfully designed for modern homes, beautifully packaged, and delivered across India.
            </motion.p>

            <motion.div 
              className="hero-cta-wrap"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28 }}
            >
              <Link to="/store" className="hero-primary-cta" id="hero-cta-button">
                <span>Shop All Products</span>
                <ArrowRight size={18} className="cta-arrow" aria-hidden="true" />
              </Link>
            </motion.div>

            {/* Supporting Benefits Row */}
            <motion.div 
              className="hero-benefits"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.36 }}
            >
              <div className="hero-benefit-item">
                <div className="benefit-icon" aria-hidden="true">
                  <Leaf size={18} strokeWidth={2} />
                </div>
                <div className="benefit-text">
                  <strong>Natural Materials</strong>
                  <small>Better for you, better for the planet.</small>
                </div>
              </div>

              <div className="hero-benefit-item">
                <div className="benefit-icon" aria-hidden="true">
                  <Sparkles size={18} strokeWidth={2} />
                </div>
                <div className="benefit-text">
                  <strong>Thoughtful Design</strong>
                  <small>For everyday Indian homes.</small>
                </div>
              </div>

              <div className="hero-benefit-item">
                <div className="benefit-icon" aria-hidden="true">
                  <RotateCw size={18} strokeWidth={2} />
                </div>
                <div className="benefit-text">
                  <strong>Made in India</strong>
                  <small>Supporting local, reducing plastic.</small>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column: Natural Stage with floating handwritten script note */}
          <div className="hero-visual-stage">
            <div className="hero-product-frame">
              <img 
                src={heroProductsMobileImg} 
                alt="EarthLife Co. Handcrafted Neem, Bamboo and Coconut Essentials" 
                className="hero-products-responsive-img"
              />
              <motion.div 
                className="hero-handwritten-note"
                initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.85, rotate: -8 }}
                animate={{ opacity: 1, scale: 1, rotate: -5 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                aria-hidden="true"
              >
                <span className="note-line">Small</span>
                <span className="note-line">Choices</span>
                <span className="note-line highlight">Big Change</span>
                <span className="note-leaf">🍃</span>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Proof Strip directly below Hero */}
      <section className="proof-strip" aria-label="EarthLife Trust Proof">
        <Container className="proof-strip-inner">
          <div className="proof-item">
            <span className="proof-icon" aria-hidden="true"><Truck size={22} strokeWidth={1.8} /></span>
            <div className="proof-content">
              <span className="proof-stat">200+</span>
              <span className="proof-label">Orders Delivered</span>
            </div>
          </div>

          <div className="proof-divider" aria-hidden="true" />

          <div className="proof-item">
            <span className="meesho-tag" aria-hidden="true">m</span>
            <div className="proof-content">
              <div className="proof-meesho-header">
                <span className="proof-stat">4.6</span>
                <span className="proof-stars" aria-label="5 stars">★★★★★</span>
              </div>
              <span className="proof-label">Seller Rating on Meesho</span>
            </div>
          </div>

          <div className="proof-divider" aria-hidden="true" />

          <div className="proof-item">
            <span className="proof-icon" aria-hidden="true"><Users size={22} strokeWidth={1.8} /></span>
            <div className="proof-content">
              <span className="proof-stat">Loved by</span>
              <span className="proof-label">Happy Customers</span>
            </div>
          </div>

          <div className="proof-divider" aria-hidden="true" />

          <div className="proof-item">
            <span className="proof-icon proof-leaf" aria-hidden="true"><Leaf size={22} strokeWidth={1.8} /></span>
            <div className="proof-content">
              <span className="proof-stat">Sustainable</span>
              <span className="proof-label">For a Greener Tomorrow</span>
            </div>
          </div>
        </Container>
      </section>

      {/* Shop by Category: Driven by live Ecwid catalog */}
      <section className="categories-section">
        <Container>
          <SectionHeading 
            title="Shop by Category" 
            subtitle="Explore our natural and sustainable collections" 
            align="center" 
          />
          {categoriesLoading ? (
            <LoadingState message="Loading categories from Ecwid..." />
          ) : categoriesError ? (
            <ErrorState 
              title="Unable to Load Categories" 
              message={categoriesError} 
              onRetry={refetchCategories} 
            />
          ) : displayedCategories.length === 0 ? (
            <EmptyState 
              title="No Categories Available" 
              message="No categories are currently published in the Ecwid store." 
            />
          ) : (
            <div className="category-grid">
              {displayedCategories.map((cat) => (
                <div 
                  key={cat.id} 
                  className="category-card-horizontal" 
                  style={{ backgroundColor: cat.bgColor }}
                  onClick={() => navigate(cat.link)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      navigate(cat.link);
                    }
                  }}
                >
                  <div className="cat-img-wrap">
                    <img 
                      src={cat.image} 
                      alt={cat.title} 
                      className="cat-img-thumb" 
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = catNeemImg;
                      }}
                    />
                  </div>
                  <div className="cat-content">
                    <h3 className="cat-title">{cat.title}</h3>
                    <p className="cat-subtitle">{cat.subtitle}</p>
                    <Link to={cat.link} className="cat-link" onClick={(e) => e.stopPropagation()}>
                      <span>Shop Now</span>
                      <span className="cat-arrow">→</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Container>
      </section>

      {/* Bestselling Products: Powered dynamically by Ecwid live data */}
      <section className="bestsellers-section" id="bestsellers-section">
        <Container>
          <div className="bestsellers-header-row">
            <div className="bestsellers-titles">
              <h2 className="bestsellers-main-title">Bestselling Products</h2>
              <p className="bestsellers-sub-title">Customer favourites, chosen for a cleaner and greener tomorrow.</p>
            </div>
            <Link to="/store" className="bestsellers-view-all">
              <span>View All</span>
              <span className="view-all-arrow">→</span>
            </Link>
          </div>

          {productsLoading ? (
            <LoadingState message="Loading live products from Ecwid..." />
          ) : productsError ? (
            <ErrorState 
              title="Unable to Load Products" 
              message={productsError} 
              onRetry={refetchProducts} 
            />
          ) : featuredProducts.length === 0 ? (
            <EmptyState 
              title="No Products Available" 
              message="There are currently no products available in the Ecwid catalog." 
              actionText="Visit Store"
              onAction={() => navigate('/store')}
            />
          ) : (
            <>
              {/* Products Grid / Slider */}
              <div className="bestsellers-carousel-wrapper">
                {numSlides > 1 && (
                  <button 
                    className="carousel-nav-btn prev-btn" 
                    onClick={prevSlide}
                    aria-label="Previous products"
                  >
                    <ChevronLeft size={22} />
                  </button>
                )}

                <div className="products-showcase-grid">
                  {displayedProducts.map((product) => {
                    const badgeText = product.ribbon?.text || (product.discountPercent ? `${product.discountPercent}% OFF` : null);

                    return (
                      <div 
                        key={product.id}
                        className="product-card botanical-glow-card"
                        onClick={() => handleProductClick(product.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleProductClick(product.id);
                        }}
                      >
                        {/* Top Badges */}
                        {badgeText && (
                          <div className="product-card-top">
                            <span 
                              className="product-bestseller-badge"
                              style={product.ribbon?.color ? { backgroundColor: product.ribbon.color } : undefined}
                            >
                              {badgeText}
                            </span>
                          </div>
                        )}

                        {/* Product Image */}
                        <div className="product-img-holder">
                          <img 
                            src={product.image || catNeemImg} 
                            alt={product.name} 
                            className="product-card-img"
                            loading="lazy"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = catNeemImg;
                            }}
                          />
                        </div>

                        {/* Product Info */}
                        <div className="product-info-wrapper">
                          <h3 className="product-card-name">{product.name}</h3>
                          
                          <div className="product-card-price-row">
                            <span className="product-card-price">₹{product.price}</span>
                            {product.compareToPrice && (
                              <span className="product-card-compare-price">₹{product.compareToPrice}</span>
                            )}
                            {product.discountPercent && (
                              <span className="product-card-discount-badge">{product.discountPercent}% OFF</span>
                            )}
                          </div>

                          {!product.inStock && (
                            <span className="product-card-out-of-stock">Out of Stock</span>
                          )}

                          <button 
                            className="product-add-cart-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleProductClick(product.id);
                            }}
                            aria-label={`View ${product.name}`}
                          >
                            <span>View Product</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {numSlides > 1 && (
                  <button 
                    className="carousel-nav-btn next-btn" 
                    onClick={nextSlide}
                    aria-label="Next products"
                  >
                    <ChevronRight size={22} />
                  </button>
                )}
              </div>

              {/* Dots Indicator */}
              {numSlides > 1 && (
                <div className="carousel-dots-row" aria-label="Slider navigation">
                  {Array.from({ length: numSlides }).map((_, idx) => (
                    <button 
                      key={idx}
                      className={`carousel-dot ${safeSlide === idx ? 'active' : ''}`}
                      onClick={() => setActiveSlide(idx)}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </Container>
      </section>

      {/* Testimonials */}
      <section className="testimonials-section">
        <Container>
          <div className="testimonials-header-bar">
            <div>
              <h2 className="testimonials-heading">What Our Customers Say</h2>
              <p className="testimonials-subheading">Real people. Real experiences. A cleaner and greener tomorrow.</p>
            </div>
            <Link to="/about" className="view-more-about-btn">
              View More in About →
            </Link>
          </div>
          <div className="testimonial-grid">
            <div className="testimonial-card">
              <div className="test-header">
                <div className="avatar">M</div>
                <div>
                  <h4>Monika N.</h4>
                  <div className="stars">★★★★★</div>
                </div>
              </div>
              <p>"Nice product, very good quality and eco-friendly. Highly recommended!"</p>
            </div>
            <div className="testimonial-card">
              <div className="test-header">
                <div className="avatar">U</div>
                <div>
                  <h4>Uma M.</h4>
                  <div className="stars">★★★★★</div>
                </div>
              </div>
              <p>"Good product. Using it daily and really happy with the quality."</p>
            </div>
            <div className="testimonial-card">
              <div className="test-header">
                <div className="avatar">P</div>
                <div>
                  <h4>Priya S.</h4>
                  <div className="stars">★★★★★</div>
                </div>
              </div>
              <p>"Great quality and feels premium. Happy to support such sustainable products!"</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Why Natural CTA Banner */}
      <section className="cta-section">
        <Container className="cta-container-split">
          <div className="cta-image">
            <img 
              src={sproutHandsImg} 
              alt="Hands holding a green sprout with soil - Good for you, good for the planet" 
              className="cta-img-hand" 
            />
            <div className="cta-image-text">
              Good<br/>For You.<br/>Good for<br/>the Planet.
            </div>
          </div>
          <div className="cta-content-wrapper">
            <div className="cta-content">
              <p className="hero-subtitle">WHY NATURAL?</p>
              <h2>Small Choices. A Bigger Tomorrow.</h2>
              <p>Natural materials like Neem, Bamboo and Coconut have always been better for our homes and our planet. Discover why they matter.</p>
              <Link to="/why-natural" className="mt-2" style={{ display: 'inline-block' }}>
                <Button variant="primary">Learn More →</Button>
              </Link>
            </div>
            <div className="cta-features-row mt-3">
              <div className="cta-feat"><span className="icon">🍃</span> <span>Less Plastic<br/>Waste</span></div>
              <div className="cta-feat"><span className="icon">🤍</span> <span>Safer for<br/>Your Family</span></div>
              <div className="cta-feat"><span className="icon">🌐</span> <span>A Healthier<br/>Planet</span></div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Home;
