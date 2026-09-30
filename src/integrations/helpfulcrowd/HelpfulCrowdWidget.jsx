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
          const text = await res.text();
          if (text && text.trim() && text.trim() !== 'undefined' && text.trim() !== 'null') {
            try {
              const data = JSON.parse(text);
              if (isSubscribed && Array.isArray(data.items) && data.items.length > 0) {
                setLiveReviews(data.items);
              }
            } catch (e) {
              console.warn('HelpfulCrowd reviews response not valid JSON:', e);
            }
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

  return (
    <div className="hc-widget-wrapper">
      {/* Official HelpfulCrowd Native Target Container */}
      <div 
        ref={containerRef} 
        className="hc-widget"
      >
        <div data-hc={widgetType} {...(productId ? { 'data-hc-id': productId } : {})}></div>
      </div>
    </div>
  );
};

export default HelpfulCrowdWidget;
