import React from 'react';
import './Button.css';

const Button = ({ children, variant = 'primary', type = 'button', onClick, className = '', ...props }) => {
  const baseClass = 'el-button';
  const variantClass = `el-button--${variant}`;
  
  return (
    <button 
      type={type} 
      className={`${baseClass} ${variantClass} ${className}`} 
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
