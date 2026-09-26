import React from 'react';
import './BotanicalGlow.css';

/**
 * BotanicalGlow Component
 * Adapts the GlowingShadow concept into an eco-luxury animated perimeter border.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Existing card element or children
 * @param {string} [props.className] - Optional additional CSS classes
 * @param {boolean} [props.active=true] - Toggle glow effect on/off
 */
export const BotanicalGlow = ({ children, className = '', active = true, ...props }) => {
  if (!active) {
    return <>{children}</>;
  }

  return (
    <div className={`botanical-glow-card ${className}`.trim()} {...props}>
      {children}
    </div>
  );
};

export default BotanicalGlow;
