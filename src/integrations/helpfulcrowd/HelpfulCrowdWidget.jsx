import React, { useEffect, useRef } from 'react';
import { ensureHelpfulCrowdRuntime, refreshHelpfulCrowdWidget } from '../../hooks/useHelpfulCrowd';
import './HelpfulCrowdWidget.css';

const HelpfulCrowdWidget = ({ widgetType = 'review-slider', productId }) => {
  const containerRef = useRef(null);

  // Initialize HelpfulCrowd native widget script
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
