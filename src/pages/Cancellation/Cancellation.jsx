import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import './Cancellation.css';

const Cancellation = () => {
  const [searchParams] = useSearchParams();
  const orderIdParam = searchParams.get('orderId') || '';

  const [formData, setFormData] = useState({
    orderId: orderIdParam,
    customerName: '',
    customerEmail: '',
    reason: ''
  });
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const subject = `Cancellation Request - Order ${formData.orderId}`;
    const body = `Order ID: ${formData.orderId}
Full Name: ${formData.customerName}
Email: ${formData.customerEmail}
Reason for Cancellation: ${formData.reason}

Please review my cancellation request.`;

    const mailtoLink = `mailto:support@earthlifeco.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoLink;
    setStatus('success');
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
            <h2>Request Prepared</h2>
            <p>Your cancellation request for order <strong>{formData.orderId}</strong> has been prepared in your email client.</p>
            <p>EarthLife will review your request and contact you.</p>
            <Link to="/store" className="btn btn-primary mt-2">Return to Store</Link>
          </div>
        ) : (
          <div className="cancellation-form-wrapper">
            <p className="mb-3">
              Please note: Submitting this request <strong>does not</strong> instantly cancel your order. 
              Our support team will review your request.
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
              
                  <div className="cancellation-buttons">
                    <button 
                      type="button" 
                      className="el-button el-button--secondary" 
                      onClick={() => window.location.href='/refund-policy'}
                    >
                      View Refund & Return Policy
                    </button>
                    <button 
                      type="submit" 
                      className="el-button el-button--primary"
                    >
                      Submit Cancellation Request
                    </button>
                  </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cancellation;
