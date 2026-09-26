import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ensureHelpfulCrowdRuntime, refreshHelpfulCrowdWidget } from '../../hooks/useHelpfulCrowd';
import './HelpfulCrowdWidget.css';

const HelpfulCrowdWidget = ({ widgetType = 'review-slider', productId }) => {
  const containerRef = useRef(null);
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [liveReviews, setLiveReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hcNativeActive, setHcNativeActive] = useState(false);

  // 1. Fetch live real reviews from HelpfulCrowd via server endpoint
  useEffect(() => {
    let isSubscribed = true;

    async function fetchLiveReviews() {
      try {
        const res = await fetch('/api/helpfulcrowd/reviews');
        if (res.ok) {
          const data = await res.json();
          if (isSubscribed && Array.isArray(data.items) && data.items.length > 0) {
            setLiveReviews(data.items);
          }
        }
      } catch (err) {
        console.warn('Could not load live reviews from HelpfulCrowd endpoint:', err);
      } finally {
        if (isSubscribed) setLoading(false);
      }
    }

    fetchLiveReviews();

    return () => {
      isSubscribed = false;
    };
  }, []);

  // 2. Initialize HelpfulCrowd native widget script
  useEffect(() => {
    if (!containerRef.current) return;

    let isSubscribed = true;

    ensureHelpfulCrowdRuntime().then(() => {
      if (!isSubscribed) return;
      refreshHelpfulCrowdWidget(widgetType, productId);
    });

    const checkInterval = setInterval(() => {
      if (containerRef.current) {
        // Strip out "Independently collected by" / HelpfulCrowd logo
        const brandings = containerRef.current.querySelectorAll(
          '.hc-review-slider-show-branding, .hc-powered-by, .hc-logo, [class*="hc-powered-by"], [class*="hc-review-slider-show-branding"], a[href*="helpfulcrowd.com"]'
        );
        brandings.forEach((el) => el.remove());

        const nativeCards = containerRef.current.querySelectorAll('.hc-card__item, .hc-widget-card, .splide__slide');
        if (nativeCards.length > 0) {
          setHcNativeActive(true);
        }
      }
    }, 400);

    const timer = setTimeout(() => {
      clearInterval(checkInterval);
    }, 4000);

    return () => {
      isSubscribed = false;
      clearInterval(checkInterval);
      clearTimeout(timer);
    };
  }, [widgetType, productId]);

  // Carousel calculations
  const visibleCards = 3;
  const maxSlides = Math.max(1, liveReviews.length > visibleCards ? liveReviews.length - visibleCards + 1 : 1);
  const currentSlide = Math.min(activeSlide, maxSlides - 1);

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + maxSlides) % maxSlides);
  };

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % maxSlides);
  };

  const handleProductClick = (url) => {
    if (!url) return;
    try {
      if (url.includes('/p/')) {
        const parts = url.split('/p/');
        const ecwidId = parts[1]?.replace(/[^0-9]/g, '');
        if (ecwidId) {
          navigate(`/product/${ecwidId}`);
          return;
        }
      }
      navigate('/store');
    } catch {
      navigate('/store');
    }
  };

  const displayedReviews = liveReviews.length > visibleCards
    ? liveReviews.slice(currentSlide, currentSlide + visibleCards)
    : liveReviews;

  return (
    <div className="hc-widget-wrapper">
      {/* Official HelpfulCrowd Native Target Container */}
      <div 
        ref={containerRef} 
        className={`hc-widget ${hcNativeActive ? 'hc-native-active' : ''}`}
      >
        <div data-hc={widgetType} {...(productId ? { 'data-hc-id': productId } : {})}></div>
      </div>

      {/* Dynamic Live Reviews Slider parsed directly from HelpfulCrowd */}
      {!hcNativeActive && (
        <div className="hc-custom-slider-container">
          {loading && liveReviews.length === 0 && (
            <div className="hc-loading-skeleton">
              <div className="hc-skeleton-card"></div>
              <div className="hc-skeleton-card"></div>
              <div className="hc-skeleton-card"></div>
            </div>
          )}

          {!loading && liveReviews.length === 0 && (
            <p className="hc-empty-text">No customer reviews yet. Be the first to review!</p>
          )}

          {liveReviews.length > 0 && (
            <>
              {liveReviews.length > visibleCards && (
                <button 
                  type="button" 
                  className="hc-slider-arrow hc-arrow-prev" 
                  onClick={prevSlide}
                  aria-label="Previous reviews"
                >
                  <ChevronLeft size={20} />
                </button>
              )}

              <div className="hc-custom-cards-grid">
                {displayedReviews.map((rev) => (
                  <div key={rev.id} className="hc-custom-card">
                    {/* Header: Rating Stars & Date */}
                    <div className="hc-card-header">
                      <div className="hc-stars-row" aria-label={`${rev.rating} out of 5 stars`}>
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <span key={i} className="hc-gold-star">★</span>
                        ))}
                      </div>
                      <span className="hc-review-date">{rev.date}</span>
                    </div>

                    {/* Product Thumbnail & Title (Fetched live from HelpfulCrowd) */}
                    {rev.productName && (
                      <div 
                        className="hc-product-link-row"
                        onClick={() => handleProductClick(rev.productUrl)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleProductClick(rev.productUrl);
                        }}
                      >
                        {rev.productImage && (
                          <img 
                            src={rev.productImage} 
                            alt={rev.productName} 
                            className="hc-product-thumb" 
                          />
                        )}
                        <span className="hc-product-name">{rev.productName}</span>
                      </div>
                    )}

                    {/* Review Feedback */}
                    <div className="hc-review-content">
                      {rev.reviewBody && (
                        <p className="hc-review-feedback">{rev.reviewBody}</p>
                      )}
                    </div>

                    {/* Author Avatar & Name */}
                    <div className="hc-author-row">
                      <div className="hc-avatar-circle">
                        {rev.authorInitial || rev.author?.charAt(0) || 'P'}
                      </div>
                      <span className="hc-author-name">{rev.author}</span>
                    </div>
                  </div>
                ))}
              </div>

              {liveReviews.length > visibleCards && (
                <button 
                  type="button" 
                  className="hc-slider-arrow hc-arrow-next" 
                  onClick={nextSlide}
                  aria-label="Next reviews"
                >
                  <ChevronRight size={20} />
                </button>
              )}

              {/* Pagination indicator dots */}
              {maxSlides > 1 && (
                <div className="hc-pagination-dots" aria-hidden="true">
                  {Array.from({ length: maxSlides }).map((_, idx) => (
                    <span 
                      key={idx} 
                      className={`hc-dot ${currentSlide === idx ? 'active' : ''}`}
                      onClick={() => setActiveSlide(idx)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default HelpfulCrowdWidget;
