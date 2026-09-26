import React from 'react';
import Container from '../UI/Container/Container';
import './TrustBar.css';
import facebookIcon from '../../assets/facebook.png';
import instagramIcon from '../../assets/instagram.png';

const TrustBar = () => {
  return (
    <div className="trust-bar">
      <Container className="trust-bar-inner">
        <div className="trust-left hide-on-mobile">
          <span className="trust-item">🚚 Free Delivery on orders above ₹299</span>
          <span className="trust-pipe">|</span>
          <span className="trust-item">🛡️ 100% Secure Payments</span>
          <span className="trust-pipe">|</span>
          <span className="trust-item">🇮🇳 Made in India</span>
        </div>
        <div className="trust-right">
          <span className="trust-tagline">A Cleaner You. A Greener Tomorrow.</span>
          <div className="trust-socials">
            <a href="https://www.instagram.com/earth_lifeco" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="trust-social-link" title="Instagram">
              <img src={instagramIcon} alt="Instagram" style={{width: '14px', height: '14px'}} />
            </a>
            <a href="https://www.facebook.com/share/1DWfDgkb9E/" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="trust-social-link" title="Facebook">
              <img src={facebookIcon} alt="Facebook" style={{width: '14px', height: '14px'}} />
            </a>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default TrustBar;
