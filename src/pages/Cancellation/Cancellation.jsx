import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { policies } from '../../content/policies';
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
  const [requestType, setRequestType] = useState('cancellation');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const subject = `${requestType === 'cancellation' ? 'Cancellation' : 'Return'} Request - Order ${formData.orderId}`;
    const body = `Order ID: ${formData.orderId}
Full Name: ${formData.customerName}
Email: ${formData.customerEmail}
Request Type: ${requestType.toUpperCase()}
Reason: ${formData.reason}

Please review my request.`;

    const mailtoLink = `mailto:support@earthlifeco.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    window.location.href = mailtoLink;
    setStatus('success');
  };

  return (
    <div className="cancellation-page container">
      <div className="breadcrumbs mb-2" style={{color: 'var(--color-text-muted)', fontSize: '0.9rem', marginTop: '2rem'}}>
        Home / Request Support
      </div>
      
      <div className="cancellation-container">
        <h1>Request Order Support</h1>
        
        {status === 'success' ? (
          <div className="cancellation-success">
            <div className="success-icon">✓</div>
            <h2>Request Prepared</h2>
            <p>Your {requestType} request for order <strong>{formData.orderId}</strong> has been prepared in your email client.</p>
            <p>EarthLife will review your request and contact you.</p>
            <Link to="/store" className="btn btn-primary mt-2">Return to Store</Link>
          </div>
        ) : (
          <div className="cancellation-form-wrapper">
            <div className="form-group mb-4">
              <label style={{display: 'block', marginBottom: '0.5rem', fontWeight: 'bold'}}>Select Request Type *</label>
              
              <label style={{display: 'flex', alignItems: 'center', marginBottom: '0.5rem', cursor: 'pointer'}}>
                <input type="radio" name="requestType" value="cancellation" checked={requestType === 'cancellation'} onChange={(e) => setRequestType(e.target.value)} style={{width: 'auto', marginRight: '0.5rem'}} />
                <span>Cancellation</span>
              </label>
              
              <label style={{display: 'flex', alignItems: 'center', marginBottom: '0.5rem', cursor: 'pointer'}}>
                <input type="radio" name="requestType" value="return" checked={requestType === 'return'} onChange={(e) => setRequestType(e.target.value)} style={{width: 'auto', marginRight: '0.5rem'}} />
                <span>Return/Refund</span>
              </label>
            </div>

            <div className="policy-box p-3 mb-3" style={{background: '#f9f9f9', borderRadius: '4px'}}>
              <strong>{policies[requestType].heading}</strong>
              <p style={{fontSize: '0.85rem'}}>{policies[requestType].text}</p>
            </div>
            
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
                <label>Reason for {requestType === 'cancellation' ? 'Cancellation' : 'Return'} *</label>
                <textarea 
                  name="reason"
                  value={formData.reason} 
                  onChange={handleChange}
                  placeholder={`Please tell us why you want to ${requestType === 'cancellation' ? 'cancel' : 'return'}...`} 
                  rows="4" 
                  required
                ></textarea>
              </div>
              
              <div className="cancellation-buttons mt-4 d-flex gap-3">
                <Link 
                  to="/refund-policy" 
                  className="el-button el-button--secondary"
                >
                  View Full Policy
                </Link>
                <button 
                  type="submit" 
                  className="el-button el-button--primary"
                >
                  Submit {requestType === 'cancellation' ? 'Cancellation' : 'Return'} Request
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
