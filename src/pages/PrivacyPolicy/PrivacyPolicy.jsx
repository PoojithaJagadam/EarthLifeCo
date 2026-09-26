import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from '../../components/UI/Container/Container';
import '../Legal/LegalPage.css';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="legal-page-wrapper">
      {/* Breadcrumb Bar */}
      <div className="legal-breadcrumb-bar">
        <Container>
          <div className="legal-breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-active">Privacy Policy</span>
          </div>
        </Container>
      </div>

      {/* Hero Header */}
      <section className="legal-hero-section">
        <Container>
          <div className="legal-hero-badge">EarthLife Co. Privacy</div>
          <h1 className="legal-hero-title">Privacy Policy</h1>
          <p className="legal-hero-subtitle">
            Understand how we collect, use, and protect your information when you visit our website.
          </p>
        </Container>
      </section>

      {/* Main Content Card */}
      <div className="legal-card-container">
        <div className="legal-card">
          <p className="legal-intro-p">
            EarthLife Co. (&quot;we,&quot; &quot;us,&quot; &quot;our&quot;) operates WWW.earthlifeco.com. This Privacy Policy explains how we collect, use, and protect your information when you visit our Site or purchase our products.
          </p>

          <h2>1. Information We Collect</h2>
          <p>When you place an order, browse our Site, or contact us, we may collect:</p>
          <p>
            Name, phone number, email address, Shipping and billing address, Order details and payment confirmation (we do not store your card/UPI details directly — these are processed securely by our payment gateway partner) and Communication you send us via Contact form,Whats App, or email.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information collected to:</p>
          <p>Process and deliver your orders.</p>
          <p>Communicate order updates, shipping status, and support queries.</p>
          <p>Improve our products, website, and customer experience.</p>
          <p>Send you promotional updates, offers, or new product announcements (only if you have not opted out).</p>

          <h2>3. Sharing of Information</h2>
          <p>We do not sell or rent your personal information to third parties. We may share necessary details with:</p>
          <p>Delivery/logistics partners, to fulfill your order.</p>
          <p>Payment gateway providers, to process transactions securely.</p>
          <p>Legal authorities, if required by applicable law.</p>

          <h2>4. Data Security</h2>
          <p>
            We take reasonable technical and organizational measures to protect your personal information from unauthorized access, alteration, or disclosure. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
          </p>

          <h2>5. Cookies</h2>
          <p>
            Our Site may use cookies to improve browsing experience, remember preferences, and analyze site traffic. You can disable cookies through your browser settings, though this may affect some Site functionality.
          </p>

          <h2>6. Your Rights</h2>
          <p>
            You may request access to, correction of, or deletion of your personal data by contacting us at <a href="mailto:support@earthlifeco.com" className="legal-email-link">support@earthlifeco.com</a>.
          </p>

          <h2>7. Third-Party Links</h2>
          <p>
            Our Site may contain links to third-party websites (e.g., social media, marketplaces). We are not responsible for the privacy practices of these external sites.
          </p>

          <h2>8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time.
          </p>
          <p>
            Changes will be posted on this page with a revised &quot;Last updated&quot; date.
          </p>

          <h2>9. Contact Us</h2>
          <p>For any questions regarding this Privacy Policy, reach out to:</p>
          <div className="legal-contact-box">
            <p><strong>EarthLife Co.</strong></p>
            <p>Email: <a href="mailto:support@earthlifeco.com" className="legal-email-link">support@earthlifeco.com</a></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
