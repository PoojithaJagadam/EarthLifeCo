import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';
import './ErrorState.css';

export const ErrorState = ({ 
  title = 'Unable to Load Products', 
  message = 'There was an issue connecting to the live Ecwid catalog. Please check your connection and try again.',
  onRetry 
}) => {
  return (
    <div className="ecwid-error-container" role="alert">
      <div className="ecwid-error-icon-wrapper">
        <AlertCircle size={32} className="ecwid-error-icon" />
      </div>
      <h3 className="ecwid-error-title">{title}</h3>
      <p className="ecwid-error-message">{message}</p>
      {onRetry && (
        <button 
          type="button" 
          onClick={onRetry} 
          className="ecwid-error-retry-btn"
        >
          <RotateCcw size={16} />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};

export default ErrorState;
