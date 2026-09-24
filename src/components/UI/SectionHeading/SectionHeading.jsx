import React from 'react';
import './SectionHeading.css';

const SectionHeading = ({ title, subtitle, align = 'center', className = '' }) => {
  return (
    <div className={`section-heading text-${align} ${className}`}>
      <h2>{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </div>
  );
};

export default SectionHeading;
