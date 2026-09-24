import React from 'react';
import './LoadingState.css';

export const LoadingState = ({ message = 'Loading live products from Ecwid...' }) => {
  return (
    <div className="ecwid-loading-container" role="status" aria-live="polite">
      <div className="ecwid-loading-spinner" aria-hidden="true"></div>
      <p className="ecwid-loading-text">{message}</p>
    </div>
  );
};

export default LoadingState;
