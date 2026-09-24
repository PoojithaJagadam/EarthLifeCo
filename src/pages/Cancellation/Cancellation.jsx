import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Cancellation.css';

const Cancellation = () => {
  const [formData, setFormData] = useState({
    orderId: '',
    customerName: '',
    customerEmail: '',
    reason: ''
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      const endpoint = (import.meta.env.VITE_API_BASE_URL || '') + '/api/cancellation-request';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Something went wrong.');
      }
    } catch {
      setStatus('error');
      setErrorMessage('Network error. Please try again later.');
    }
  };

  return (
    <div className="cancellation-page container">
      <div className="breadcrumbs mb-2" style={{color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '2rem'}}>
        Home / Request Cancellation
      </div>
      
      <div className="cancellation-container">
        <h1>Request Order Cancellation</h1>
        
        {status === 'success' ? (
          <div className="cancellation-success">
            <div className="success-icon">✓</div>
            <h2>Request Submitted</h2>
            <p>Your cancellation request for order <strong>{formData.orderId}</strong> has been sent to our team.</p>
            <p>We will review the order status in our system. If the order has not been processed or shipped yet, we will cancel it and initiate a refund. You will receive an email update shortly.</p>
            <Link to="/store" className="btn btn-primary mt-2">Return to Store</Link>
          </div>
        ) : (
          <div className="cancellation-form-wrapper">
            <p className="mb-3">
              Please note: Submitting this request <strong>does not</strong> instantly cancel your order. 
              Our support team will review your request. If the order is already processed or shipped, cancellation may not be available.
            </p>
            
            <form onSubmit={handleSubmit} className="cancellation-form">
              <div className="form-group">
                <label>Order ID *</label>
                <input 
                  type="text" 
                  name="orderId" 
                  value={formData.orderId} 
                  onChange={handleChange}
                  placeholder="e.g. 12345" 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Full Name *</label>
                <input 
                  type="text" 
                  name="customerName" 
                  value={formData.customerName} 
                  onChange={handleChange}
                  placeholder="Name used on order" 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Email Address *</label>
                <input 
                  type="email" 
                  name="customerEmail" 
                  value={formData.customerEmail} 
                  onChange={handleChange}
                  placeholder="Email used on order" 
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Reason for Cancellation *</label>
                <textarea 
                  name="reason"
                  value={formData.reason} 
                  onChange={handleChange}
                  placeholder="Please tell us why you want to cancel..." 
                  rows="4" 
                  required
                ></textarea>
              </div>
              
              {status === 'error' && (
                <div className="error-message mb-2">{errorMessage}</div>
              )}
              
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={status === 'loading'}
                style={{ width: '100%' }}
              >
                {status === 'loading' ? 'Submitting...' : 'Submit Cancellation Request'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cancellation;
