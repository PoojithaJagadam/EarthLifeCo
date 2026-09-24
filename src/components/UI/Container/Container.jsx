import React from 'react';

const Container = ({ children, className = '', as: Component = 'div', ...props }) => {
  return (
    <Component className={`container ${className}`} {...props}>
      {children}
    </Component>
  );
};

export default Container;
