import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Container from '../../components/UI/Container/Container';
import '../Legal/LegalPage.css';
import { RandomLetterSwap } from '../../components/UI/RandomLetterSwap/RandomLetterSwap';

const RefundPolicy = () => {
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
            <span className="breadcrumb-active">Refund Policy</span>
          </div>
        </Container>
      </div>

      {/* Hero Header */}
      <section className="legal-hero-section">
        <Container>
          <div className="legal-hero-badge">EarthLife Co. Guarantee</div>
          <h1 className="legal-hero-title">Refund Policy</h1>
          <p className="legal-hero-subtitle">
            Information regarding returns, refunds, timelines, and cancellations for your orders.
          </p>
        </Container>
      </section>

      {/* Main Content Card */}
      <div className="legal-card-container">
        <div className="legal-card">
          <p className="legal-intro-p">
            At EarthLife Co., we want you to be happy with your purchase. This Refund Policy explains how returns and refunds work for orders placed on www.earthlifeco.com.
          </p>

          <h2>1. Eligibility for Returns</h2>
          <p>Returns are accepted within 7 days of delivery.</p>
          <p>The product must be unused and in its original packaging.</p>
          <p>Proof of purchase (order ID, invoice, or confirmation message) is required.</p>
          <p>
            Due to the nature of certain products (e.g., toothbrushes, tissues, scrub pads), items that have been used cannot be returned for hygiene reasons, unless the product is defective or damaged on arrival.
          </p>

          <h2>2. Damaged or Incorrect Items</h2>
          <p>If you receive a damaged, defective, or incorrect product:</p>
          <p>
            Contact us within 48 hours of delivery at <a href="mailto:support@earthlifeco.com" className="legal-email-link">support@earthlifeco.com</a> or via Whats App, along with photos of the product and packaging.
          </p>
          <p>We will arrange a replacement or full refund at no additional cost to you, once verified.</p>

          <h2>3. How to Request a Return/Refund</h2>
          <ol>
            <li>
              Email us at <a href="mailto:support@earthlifeco.com" className="legal-email-link">support@earthlifeco.com</a> or message us on Whats App with your order ID and reason for return.
            </li>
            <li>Our team will review your request within 1-2 business days.</li>
            <li>If approved, we will share instructions for returning the product (if applicable) or proceed directly with a refund/replacement.</li>
          </ol>

          <h2>4. Refund Method &amp; Timeline</h2>
          <p>Approved refunds will be credited to the original payment method (UPI, card, net banking) used at checkout.</p>
          <p>
            Refunds are typically processed within 7-10 business days after approval, though your bank/payment provider may take a few additional days to reflect the amount.
          </p>
          <p>
            For Cash on Delivery (COD) orders, refunds will be processed via bank transfer or UPI, based on
          </p>
          <p>details shared by the customer.</p>

          <h2>5. Non-Returnable Situations</h2>
          <p>We are unable to accept returns or issue refunds in the following cases:</p>
          <p>Product used or not in original condition.</p>
          <p>(except for verified damaged/defective items)</p>
          <p>Return request made after 7 days of delivery.</p>
          <p>Change of mind after the product has been delivered and used.</p>
          <p>Free gifts or promotional items included with an order.</p>

          <h2>6. Order Cancellations</h2>
          <p>
            Orders can be cancelled before they are shipped by <Link to="/cancellation-request" className="legal-email-link">submitting a cancellation request</Link> or contacting us immediately at <a href="mailto:support@earthlifeco.com" className="legal-email-link">support@earthlifeco.com</a> or via Whats App.
          </p>
          <p>Once an order has been shipped, it cannot be cancelled, but our standard return process will apply upon delivery.</p>

          <h2>7. Contact Us</h2>
          <p>For any questions about returns or refunds, reach out to:</p>
          <div className="legal-contact-box">
            <p><strong>EarthLife Co.</strong></p>
            <p>Email: <a href="mailto:support@earthlifeco.com" className="legal-email-link">support@earthlifeco.com</a></p>
          </div>
          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/cancellation-request" className="el-button el-button--primary">
              <RandomLetterSwap text="Proceed for Order Cancellation" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
