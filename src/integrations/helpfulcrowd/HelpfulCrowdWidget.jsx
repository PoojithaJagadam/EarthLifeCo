import React, { useEffect, useRef } from 'react';
import useHelpfulCrowd from '../../hooks/useHelpfulCrowd';

const HelpfulCrowdWidget = ({ widgetType, productId }) => {
  const containerRef = useRef(null);
  
  // Map widget types to their corresponding script names as seen in the dashboard
  const scriptMap = {
    'product-summary': 'product_summary.js',
    'product-rating': 'product_rating.js',
    'product-tabs': 'product_tabs.js',
    'sidebar': 'sidebar.js',
    'review-slider': 'review_slider.js' // standard/featured slider
  };

  useHelpfulCrowd(scriptMap[widgetType]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear container on remount or prop change to avoid duplicates in SPA
    containerRef.current.innerHTML = '';
    
    // Create the exact HelpfulCrowd widget structure
    const hcDiv = document.createElement('div');
    hcDiv.setAttribute('data-hc', widgetType);
    if (productId) {
      hcDiv.setAttribute('data-hc-id', productId);
    }
    
    containerRef.current.appendChild(hcDiv);
    
    // Dispatch helpfulcrowd:refresh event to trigger widget re-initialization in SPA
    // We use setTimeout to ensure the DOM has settled before HelpfulCrowd scans it
    setTimeout(() => {
      const event = new Event('helpfulcrowd:refresh');
      document.dispatchEvent(event);
      window.dispatchEvent(event);
    }, 100);

  }, [widgetType, productId]);

  return (
    <div className="hc-widget" ref={containerRef}></div>
  );
};

export default HelpfulCrowdWidget;
