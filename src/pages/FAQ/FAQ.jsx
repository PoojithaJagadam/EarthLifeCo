import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Leaf, 
  Sparkles, 
  Truck, 
  Package, 
  CreditCard, 
  MapPin, 
  FileText, 
  Mail, 
  ChevronDown, 
  ArrowRight 
} from 'lucide-react';
import Container from '../../components/UI/Container/Container';
import heroLeafImg from '../../assets/hero_leaf_transparent.png';
import heroProductsImg from '../../assets/hero_products_mobile.png';
import './FAQ.css';

// India Outline Icon
const IndiaIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.5 2 7 4.5 7 7c0 3 2.5 5 2.5 7.5S8 18 10 20.5c1.5 2 3.5 2 4 2s2.5-1 3.5-3c1.2-2.3 0-5 1.5-7.5s2.5-4.5 1-7C18.5 3 15.5 2 12 2z" />
    <path d="M11 7h2v2h-2z" />
    <circle cx="12" cy="12" r="1.5" />
  </svg>
);

const FAQ_DATA = [
  {
    icon: <Leaf size={22} className="faq-type-icon" />,
    question: 'What products does EarthLife Co. offer?',
    answer: 'We offer a range of natural everyday essentials, including Neem wood combs, bamboo toothbrushes, bamboo facial tissues, and coconut coir scrub pads.'
  },
  {
    icon: <Sparkles size={22} className="faq-type-icon" />,
    question: 'What natural materials do you use?',
    answer: 'We thoughtfully choose materials like Neem wood, Bamboo, and Coconut Coir for their sustainability and natural benefits.'
  },
  {
    icon: <IndiaIcon />,
    question: 'Where are EarthLife Co. products made?',
    answer: 'All our products are proudly made in India, supporting local communities and artisans.'
  },
  {
    icon: <Truck size={22} className="faq-type-icon" />,
    question: 'Do you ship across India?',
    answer: 'Yes, we provide shipping across India. Free delivery is available on all orders above ₹299.'
  },
  {
    icon: <Package size={22} className="faq-type-icon" />,
    question: 'What is your return policy?',
    answer: 'We offer hassle-free returns within 7 days of delivery for a worry-free shopping experience.'
  },
  {
    icon: <CreditCard size={22} className="faq-type-icon" />,
    question: 'What payment method is used at checkout?',
    answer: 'We support 100% secure payments via Razorpay, which accepts credit/debit cards, UPI, net banking, and popular wallets.'
  },
  {
    icon: <MapPin size={22} className="faq-type-icon" />,
    question: 'How can I track my order?',
    answer: 'Once your order is shipped, you will receive a tracking link via email. You can also track it in the "Track Order" section of your account.'
  },
  {
    icon: <FileText size={22} className="faq-type-icon" />,
    question: 'What information should I check before buying a product?',
    answer: 'Please check the product description for material details, care instructions, and any specific dimensions to ensure it meets your needs.'
  },
  {
    icon: <Leaf size={22} className="faq-type-icon" />,
    question: 'Why choose natural everyday products?',
    answer: 'Choosing natural products reduces plastic waste, is safer for your family, and supports a healthier planet.'
  },
  {
    icon: <Mail size={22} className="faq-type-icon" />,
    question: 'How can I contact EarthLife Co.?',
    answer: 'You can reach us anytime at support@earthlifeco.com. We usually respond within one business day.'
  }
];

const FAQItem = ({ icon, question, answer, isOpen, onToggle }) => {
  return (
    <div className={`faq-card ${isOpen ? 'active' : ''}`}>
      <button 
        className="faq-card-header" 
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <div className="faq-icon-bubble">
          {icon}
        </div>
        <span className="faq-question-text">{question}</span>
        <div className={`faq-chevron-wrap ${isOpen ? 'rotated' : ''}`}>
          <ChevronDown size={20} />
        </div>
      </button>
      {isOpen && (
        <div className="faq-card-body">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const handleToggle = (index) => {
    setOpenIndex(prev => prev === index ? null : index);
  };

  return (
    <div className="faq-page">
      {/* Top Breadcrumb */}
      <div className="faq-breadcrumb-bar">
        <Container>
          <div className="faq-breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-active">FAQs</span>
          </div>
        </Container>
      </div>

      {/* Hero Section with panoramic hero background & decorative green leaves */}
      <section className="faq-hero-section">
        <img 
          src={heroLeafImg} 
          alt="" 
          aria-hidden="true" 
          className="faq-hero-leaf-topleft" 
        />
        <Container>
          <div className="faq-hero-grid">
            <div className="faq-hero-text">
              <h1 className="faq-hero-title">
                Frequently<br />
                Asked Questions
              </h1>
              <p className="faq-hero-desc">
                Simple answers about our products,<br />
                orders and everyday natural living.
              </p>
            </div>

            <div className="faq-hero-badge-col">
              <div className="faq-visual-stage">
                <img 
                  src={heroProductsImg} 
                  alt="EarthLife Co. Natural Essentials Collection" 
                  className="faq-hero-img" 
                  loading="eager"
                />
                <div className="faq-hero-cursive-badge">
                  <div className="cursive-line1">Small</div>
                  <div className="cursive-line2">Choices <span className="heart-symbol">♡</span></div>
                  <div className="cursive-line3">
                    Big Change <Leaf className="cursive-leaf-icon" size={24} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ List Section */}
      <section className="faq-list-section">
        <Container>
          <div className="faq-accordion-container">
            {FAQ_DATA.map((faq, index) => (
              <FAQItem 
                key={index} 
                icon={faq.icon} 
                question={faq.question} 
                answer={faq.answer}
                isOpen={openIndex === index}
                onToggle={() => handleToggle(index)}
              />
            ))}
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="faq-cta-section">
        <Container>
          <div className="faq-cta-banner">
            <div className="faq-cta-content">
              <span className="faq-cta-tag">STILL HAVE A QUESTION?</span>
              <h2 className="faq-cta-title">We're happy to help.</h2>
              <p className="faq-cta-desc">
                Feel free to reach out to us at <a href="mailto:support@earthlifeco.com" className="email-link">support@earthlifeco.com</a>
              </p>
              <div className="faq-cta-btn-wrap">
                <Link to="/contact" className="faq-contact-btn">
                  <span>Contact Us</span>
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            <div className="faq-cta-aside">
              <div className="faq-cursive-planet-badge">
                <div className="planet-line1">Good</div>
                <div className="planet-line2">for You</div>
                <div className="planet-line3">Good for the</div>
                <div className="planet-line4">
                  Planet <Leaf size={24} className="planet-leaf-icon" />
                </div>
              </div>
            </div>

            <img 
              src={heroLeafImg} 
              alt="" 
              aria-hidden="true" 
              className="faq-cta-leaf-decoration" 
            />
          </div>
        </Container>
      </section>
    </div>
  );
};

export default FAQ;
