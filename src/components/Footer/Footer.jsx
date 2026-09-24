import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Camera, Share2, Play, Pin } from 'lucide-react';
import Container from '../UI/Container/Container';
import logoImg from '../../assets/logo.png';
import './Footer.css';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setTimeout(() => {
        setSubscribed(false);
        setEmail('');
      }, 3500);
    }
  };

  return (
    <footer className="footer" id="app-footer">
      <Container className="footer-grid">
        {/* Column 1: Brand & Socials */}
        <div className="footer-col footer-col-brand">
          <div className="footer-logo">
            <Link to="/" className="footer-logo-link">
              <img src={logoImg} alt="EarthLife Co." className="footer-logo-img" />
            </Link>
          </div>
          <div className="footer-social-icons">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer-social-btn" title="Instagram">
              <Camera size={16} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="footer-social-btn" title="Facebook">
              <Share2 size={16} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="footer-social-btn" title="YouTube">
              <Play size={16} />
            </a>
            <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer" aria-label="Pinterest" className="footer-social-btn footer-pin-btn" title="Pinterest">
              <Pin size={16} />
            </a>
          </div>
        </div>
        
        {/* Column 2: Shop */}
        <div className="footer-col">
          <h3 className="footer-col-heading">Shop</h3>
          <ul className="footer-links-list">
            <li><Link to="/store">All Products</Link></li>
            <li><Link to="/store#!/~/category/id=206710677">Neem Products</Link></li>
            <li><Link to="/store#!/~/category/id=206706898">Bamboo Products</Link></li>
            <li><Link to="/store#!/~/category/id=206708145">Coconut Coir Products</Link></li>
            <li><Link to="/store">Gift Sets</Link></li>
          </ul>
        </div>
        
        {/* Column 3: Customer Care */}
        <div className="footer-col">
          <h3 className="footer-col-heading">Customer Care</h3>
          <ul className="footer-links-list">
            <li><Link to="/account">My Account</Link></li>
            <li><Link to="/store#!/~/account/orders">Track Order</Link></li>
            <li><Link to="/cancellation-request">Returns & Refunds</Link></li>
            <li><Link to="/faqs">Shipping Information</Link></li>
            <li><Link to="/faqs">FAQs</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
          </ul>
        </div>
        
        {/* Column 4: Our Story */}
        <div className="footer-col">
          <h3 className="footer-col-heading">Our Story</h3>
          <ul className="footer-links-list">
            <li><Link to="/about">About EarthLife Co.</Link></li>
            <li><Link to="/why-natural">Why Natural?</Link></li>
            <li><Link to="/about">Blog</Link></li>
          </ul>
        </div>

        {/* Column 5: Subscribe to our newsletter */}
        <div className="footer-col footer-col-subscribe">
          <h3 className="footer-col-heading">Subscribe to our newsletter</h3>
          <p className="subscribe-desc">
            Get updates on new products, offers and sustainable living tips.
          </p>
          <form className="newsletter-form" onSubmit={handleSubscribe}>
            <input 
              type="email" 
              placeholder="Enter your email address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              className="newsletter-input"
            />
            <button type="submit" className="newsletter-submit-btn">
              {subscribed ? 'Subscribed!' : 'Subscribe'}
            </button>
          </form>
          {subscribed && (
            <p className="newsletter-success-note">
              🌱 Thank you for subscribing to EarthLife Co.!
            </p>
          )}
        </div>
      </Container>
      
      {/* Footer Bottom Bar */}
      <div className="footer-bottom">
        <Container className="bottom-flex">
          <p className="copyright-text">© 2025 EarthLife Co. All rights reserved.</p>
          <div className="footer-legal">
            <Link to="/contact">Privacy Policy</Link>
            <span className="legal-divider">|</span>
            <Link to="/contact">Terms & Conditions</Link>
            <span className="legal-divider">|</span>
            <Link to="/contact">Shipping Policy</Link>
            <span className="legal-divider">|</span>
            <Link to="/contact">Contact Us</Link>
          </div>
        </Container>
      </div>
    </footer>
  );
};

export default Footer;
