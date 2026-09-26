import React from 'react';
import { Package } from 'lucide-react';
import './EmptyState.css';

export const EmptyState = ({
  title = 'No Products Found',
  message = 'There are currently no products available in this section.',
  actionText,
  onAction
}) => {
  return (
    <div className="ecwid-empty-container" role="status">
      <div className="ecwid-empty-icon-wrapper" aria-hidden="true">
        <Package size={32} className="ecwid-empty-icon" />
      </div>
      <h3 className="ecwid-empty-title">{title}</h3>
      <p className="ecwid-empty-message">{message}</p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="ecwid-empty-action-btn"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
