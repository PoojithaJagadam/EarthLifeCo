import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Truck, 
  RotateCcw, 
  Leaf, 
  ArrowRight 
} from 'lucide-react';
import Container from '../../components/UI/Container/Container';
import heroLeafImg from '../../assets/hero_leaf_transparent.png';
import heroProductsImg from '../../assets/hero_products_mobile.png';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = [];
    if (formData.subject) {
      params.push(`subject=${encodeURIComponent(formData.subject)}`);
    }
    const bodyParts = [];
    if (formData.fullName) bodyParts.push(`Name: ${formData.fullName}`);
    if (formData.email) bodyParts.push(`Email: ${formData.email}`);
    if (formData.message) bodyParts.push(`Message: ${formData.message}`);
    if (bodyParts.length > 0) {
      params.push(`body=${encodeURIComponent(bodyParts.join('\n'))}`);
    }
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    window.location.href = `mailto:support@earthlifeco.com${query}`;
    
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="contact-page">
      {/* Top Breadcrumb */}
      <div className="contact-breadcrumb-bar">
        <Container>
          <div className="contact-breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-active">Contact Us</span>
          </div>
        </Container>
      </div>

      {/* Hero Section with panoramic hero background */}
      <section className="contact-hero-section">
        <img 
          src={heroLeafImg} 
          alt="" 
          aria-hidden="true" 
          className="contact-hero-leaf-topleft" 
        />
        <Container>
          <div className="contact-hero-grid">
            <div className="contact-hero-text">
              <h1 className="contact-hero-title">Let's Talk.</h1>
              <p className="contact-hero-desc">
                Have a question about our products,<br />
                your order, or anything EarthLife?<br />
                We're here to help.
              </p>
              
              <div className="contact-hero-left-badge">
                <div className="left-badge-line1">Good for You.</div>
                <div className="left-badge-line2">
                  Good for the Planet <Leaf size={20} className="badge-leaf-icon" />
                </div>
              </div>
            </div>

            <div className="contact-hero-badge-col">
              <div className="contact-visual-stage">
                <img 
                  src={heroProductsImg} 
                  alt="EarthLife Co. Natural Essentials Collection" 
                  className="contact-hero-img" 
                  loading="eager"
                />
                <div className="contact-hero-cursive-badge">
                  <div className="cursive-line1">Small</div>
                  <div className="cursive-line2">Choices</div>
                  <div className="cursive-line3">
                    Big Change <Leaf className="cursive-leaf-icon" size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Main Content: Info on left, Form on right */}
      <section className="contact-main-section">
        <Container>
          <div className="contact-main-grid">
            {/* Left Column: Connect with EarthLife */}
            <div className="contact-info-col">
              <span className="contact-section-tag">CONTACT US</span>
              <h2 className="contact-section-heading">Connect with EarthLife.</h2>
              
              <div className="contact-intro-text">
                <p>
                  Have a question about our products, your order, or anything EarthLife? We're here to help.
                </p>
                <p>
                  Contact us at <a href="mailto:support@earthlifeco.com" className="contact-email-link">support@earthlifeco.com</a>.
                </p>
                <p>
                  Our dedicated support team will respond within one business day to ensure a smooth and hassle-free shopping experience.
                </p>
              </div>

              <div className="contact-info-list">
                {/* 1. Email Us */}
                <div className="contact-info-item">
                  <div className="contact-info-icon-bubble">
                    <Mail size={22} />
                  </div>
                  <div className="contact-info-details">
                    <span className="info-item-tag">EMAIL US</span>
                    <h4 className="info-item-title">
                      <a href="mailto:support@earthlifeco.com">support@earthlifeco.com</a>
                    </h4>
                    <p className="info-item-desc">We're here to help.</p>
                  </div>
                </div>

                {/* 2. Shipping */}
                <div className="contact-info-item">
                  <div className="contact-info-icon-bubble">
                    <Truck size={22} />
                  </div>
                  <div className="contact-info-details">
                    <span className="info-item-tag">SHIPPING</span>
                    <h4 className="info-item-title">Made in India — Shipping Across India</h4>
                    <p className="info-item-desc">Delivering natural essentials to every home.</p>
                  </div>
                </div>

                {/* 3. Returns */}
                <div className="contact-info-item">
                  <div className="contact-info-icon-bubble">
                    <RotateCcw size={22} />
                  </div>
                  <div className="contact-info-details">
                    <span className="info-item-tag">RETURNS</span>
                    <h4 className="info-item-title">Returns within 7 days</h4>
                    <p className="info-item-desc">Hassle-free returns for a worry-free experience.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Send Us a Message Card */}
            <div className="contact-form-col">
              <div className="contact-card">
                <h3 className="contact-card-title">Send Us a Message</h3>
                
                {submitted && (
                  <div className="contact-success-alert">
                    Thank you! Opening your email client to send your message...
                  </div>
                )}

                <form 
                  className="contact-styled-form" 
                  action="mailto:support@earthlifeco.com"
                  method="post"
                  encType="text/plain"
                  onSubmit={handleSubmit}
                >
                  <div className="form-group-item">
                    <label htmlFor="fullName" className="form-field-label">
                      Full Name <span className="required-star">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Your full name" 
                      required 
                      className="form-field-input"
                    />
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="email" className="form-field-label">
                      Email Address <span className="required-star">*</span>
                    </label>
                    <input 
                      type="email" 
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com" 
                      required 
                      className="form-field-input"
                    />
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="subject" className="form-field-label">
                      Subject <span className="required-star">*</span>
                    </label>
                    <input 
                      type="text" 
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?" 
                      required 
                      className="form-field-input"
                    />
                  </div>

                  <div className="form-group-item">
                    <label htmlFor="message" className="form-field-label">
                      Message <span className="required-star">*</span>
                    </label>
                    <textarea 
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Write your message here..." 
                      rows="4" 
                      required 
                      className="form-field-textarea"
                    ></textarea>
                  </div>

                  <button 
                    type="submit" 
                    formAction="mailto:support@earthlifeco.com"
                    className="contact-whatsapp-btn"
                  >
                    <Mail size={20} className="whatsapp-icon" />
                    <span>Send Message via Email</span>
                    <ArrowRight size={18} />
                  </button>

                  <p className="form-footer-hint">
                    We usually respond within one business day.
                  </p>
                </form>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Bottom Quick Question Banner */}
      <section className="contact-faq-banner-section">
        <Container>
          <div className="contact-faq-banner">
            <img 
              src={heroLeafImg} 
              alt="" 
              aria-hidden="true" 
              className="faq-banner-leaf-left" 
            />
            
            <div className="contact-faq-text-wrap">
              <h2 className="contact-faq-banner-title">Have a quick question?</h2>
              <p className="contact-faq-banner-desc">You might find the answer in our FAQs.</p>
              <div className="contact-faq-btn-wrap">
                <Link to="/faqs" className="contact-faq-btn">
                  <span>Visit our FAQs</span>
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            <div className="contact-faq-badge-wrap">
              <div className="faq-cursive-badge">
                <div className="faq-badge-line1">Small</div>
                <div className="faq-badge-line2">Steps</div>
                <div className="faq-badge-line3">Brighter</div>
                <div className="faq-badge-line4">
                  Tomorrows <Leaf size={22} className="faq-badge-leaf" />
                </div>
              </div>
            </div>

            <img 
              src={heroLeafImg} 
              alt="" 
              aria-hidden="true" 
              className="faq-banner-leaf-right" 
            />
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Contact;
