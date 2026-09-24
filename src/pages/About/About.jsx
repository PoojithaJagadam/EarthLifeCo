import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Leaf, 
  Sparkles, 
  Home, 
  IndianRupee, 
  ShoppingBag, 
  Star, 
  ArrowRight
} from 'lucide-react';
import Container from '../../components/UI/Container/Container';
import kanpurImg from '../../assets/images/about_kanpur_1790187866500.jpg';
import teamImg from '../../assets/images/about_team_1790187883385.jpg';
import heroLeafImg from '../../assets/hero_leaf_transparent.png';
import heroProductsImg from '../../assets/hero_products_mobile.png';
import './About.css';

// India Outline SVG Icon for "Proudly Made in India"
const IndiaMapIcon = () => (
  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C8.5 2 7 4.5 7 7c0 3 2.5 5 2.5 7.5S8 18 10 20.5c1.5 2 3.5 2 4 2s2.5-1 3.5-3c1.2-2.3 0-5 1.5-7.5s2.5-4.5 1-7C18.5 3 15.5 2 12 2z" />
    <path d="M11 7h2v2h-2z" />
    <circle cx="12" cy="12" r="1.5" />
  </svg>
);

const About = () => {
  return (
    <div className="about-page">
      {/* Top Breadcrumb */}
      <div className="about-breadcrumb-bar">
        <Container>
          <div className="about-breadcrumb">
            <Link to="/">Home</Link>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-active">About Us</span>
          </div>
        </Container>
      </div>

      {/* Hero Section with panoramic hero background & decorative green leaves */}
      <section className="about-hero-section">
        <img 
          src={heroLeafImg} 
          alt="" 
          aria-hidden="true" 
          className="about-hero-leaf-topleft" 
        />
        <Container>
          <div className="about-hero-grid">
            <div className="about-hero-text">
              <span className="about-section-tag">ABOUT EARTHLIFE CO.</span>
              <h1 className="about-hero-title">
                Everyday Essentials.<br />
                A Kinder Tomorrow.
              </h1>
              <p className="about-hero-desc">
                We're a homegrown brand creating simple, natural alternatives for modern Indian homes — good for you, good for the planet.
              </p>
            </div>
            <div className="about-hero-badge-col">
              <div className="about-visual-stage">
                <img 
                  src={heroProductsImg} 
                  alt="EarthLife Co. Natural Essentials Collection" 
                  className="about-hero-img" 
                  loading="eager"
                />
                <div className="about-hero-cursive-badge">
                  <span className="cursive-text">Live Naturally</span>
                  <Leaf className="cursive-leaf-icon" size={24} />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Our Story Section */}
      <section className="about-story-section">
        <Container>
          <div className="about-story-grid">
            <div className="about-story-media">
              <div className="kanpur-card-container">
                <div className="kanpur-polaroid">
                  <img 
                    src={kanpurImg} 
                    alt="Historic ghats of Kanpur, India" 
                    className="kanpur-photo" 
                  />
                  <div className="kanpur-sticky-note">
                    <span>It started in Kanpur</span>
                    <span className="heart-symbol">♡</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="about-story-content">
              <span className="about-section-tag">OUR STORY</span>
              <h2 className="about-section-heading">A Simple Question. A Greater Purpose.</h2>
              <div className="about-story-paragraphs">
                <p>
                  EarthLife Co. was born in Kanpur from a simple question — why are Indian families still using plastic toothbrushes, synthetic combs, and chemical-laden tissues when Bamboo, Neem, and Coconut have always been better?
                </p>
                <p>
                  That question led us to create EarthLife Co. — a brand that brings together nature, simplicity, and everyday elegance. We design thoughtful, natural essentials for modern homes, at prices that fit everyday lives.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Our Family Section */}
      <section className="about-family-section">
        <Container>
          <div className="about-family-grid">
            <div className="about-family-content">
              <span className="about-section-tag">OUR FAMILY</span>
              <h2 className="about-section-heading">
                A Small Team,<br />
                A Big Thank You.
              </h2>
              <p className="about-family-desc">
                We're a small team of nature-lovers, working every day to bring better, more sustainable choices to your home. Every order is packed with care, and every message is answered personally — because you're not just a customer, you're part of our journey.
              </p>
            </div>
            <div className="about-family-media">
              <div className="team-photo-card">
                <img 
                  src={teamImg} 
                  alt="The dedicated EarthLife Co. team packing sustainable products" 
                  className="team-photo-img" 
                />
                <div className="team-cursive-badge">
                  <div className="team-badge-line1">Same People</div>
                  <div className="team-badge-line2">
                    Real Care <span className="heart-symbol">♡</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Our Promise (Values That Guide Us) */}
      <section className="about-promise-section">
        <Container>
          <div className="about-promise-header">
            <span className="about-section-tag">OUR PROMISE</span>
            <h2 className="about-section-heading">Values That Guide Us.</h2>
          </div>

          <div className="about-values-grid">
            {/* 1. Natural Materials */}
            <div className="about-value-box">
              <div className="value-icon-circle">
                <Leaf size={28} className="val-icon" />
              </div>
              <h3 className="value-box-title">Natural Materials</h3>
              <p className="value-box-desc">Thoughtfully chosen from nature.</p>
            </div>

            {/* 2. Proudly Made in India */}
            <div className="about-value-box">
              <div className="value-icon-circle">
                <IndiaMapIcon />
              </div>
              <h3 className="value-box-title">Proudly Made in India</h3>
              <p className="value-box-desc">Supporting local communities.</p>
            </div>

            {/* 3. Designed with Less Plastic */}
            <div className="about-value-box">
              <div className="value-icon-circle">
                <Sparkles size={28} className="val-icon" />
              </div>
              <h3 className="value-box-title">Designed with Less Plastic</h3>
              <p className="value-box-desc">Cleaner choices for a healthier planet.</p>
            </div>

            {/* 4. Made for Everyday Homes */}
            <div className="about-value-box">
              <div className="value-icon-circle">
                <Home size={28} className="val-icon" />
              </div>
              <h3 className="value-box-title">Made for Everyday Homes</h3>
              <p className="value-box-desc">Simple, useful and built for real life.</p>
            </div>

            {/* 5. Premium Feel & Honest Pricing */}
            <div className="about-value-box">
              <div className="value-icon-circle">
                <IndianRupee size={28} className="val-icon" />
              </div>
              <h3 className="value-box-title">Premium Feel & Honest Pricing</h3>
              <p className="value-box-desc">High-quality essentials at fair prices.</p>
            </div>
          </div>
        </Container>
      </section>

      {/* Customer Reviews Section */}
      <section className="about-reviews-section">
        <Container>
          <div className="about-reviews-topbar">
            <div className="reviews-header-left">
              <span className="about-section-tag">WHAT OUR CUSTOMERS SAY</span>
              <h2 className="about-section-heading">Real People. Real Impact.</h2>
              <p className="reviews-subtext">We're grateful for the love and support from our growing community.</p>
            </div>

            <div className="reviews-badges-right">
              {/* Meesho rating card */}
              <div className="meesho-rating-card">
                <div className="meesho-logo-pill">meesho</div>
                <div className="meesho-rating-info">
                  <div className="rating-score-row">
                    <span className="score-num">4.6</span>
                    <div className="star-row">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                      ))}
                    </div>
                  </div>
                  <span className="rating-platform-label">Seller Rating on Meesho</span>
                </div>
              </div>

              {/* Orders Delivered card */}
              <div className="orders-delivered-card">
                <div className="bag-icon-wrap">
                  <ShoppingBag size={24} color="#D97706" />
                </div>
                <div className="orders-info">
                  <div className="orders-count">200+</div>
                  <div className="orders-label">Orders Delivered</div>
                </div>
              </div>
            </div>
          </div>

          {/* Testimonial Cards */}
          <div className="testimonials-cards-grid">
            <div className="testimonial-card">
              <div className="testimonial-header">
                <div className="customer-avatar avatar-m">M</div>
                <div className="customer-meta">
                  <h4 className="customer-name">Monika N.</h4>
                  <div className="customer-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="testimonial-quote">"Very good quality product. Totally worth it!"</p>
              <div className="verified-buyer-badge">
                <span>— Verified Purchase</span>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-header">
                <div className="customer-avatar avatar-u">U</div>
                <div className="customer-meta">
                  <h4 className="customer-name">Uma M.</h4>
                  <div className="customer-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="testimonial-quote">"Loved the natural feel. Great for daily use."</p>
              <div className="verified-buyer-badge">
                <span>— Verified Purchase</span>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testimonial-header">
                <div className="customer-avatar avatar-p">P</div>
                <div className="customer-meta">
                  <h4 className="customer-name">Priya S.</h4>
                  <div className="customer-stars">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                    ))}
                  </div>
                </div>
              </div>
              <p className="testimonial-quote">"Nice product and eco-friendly. Highly recommend!"</p>
              <div className="verified-buyer-badge">
                <span>— Verified Purchase</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="about-cta-section">
        <Container>
          <div className="about-cta-banner">
            <img 
              src={heroLeafImg} 
              alt="" 
              aria-hidden="true" 
              className="about-cta-leaf-decoration" 
            />
            <div className="about-cta-text-group">
              <span className="about-cta-tag">READY FOR A GREENER TOMORROW?</span>
              <h2 className="about-cta-headline">Choose natural. Support a healthier planet.</h2>
            </div>
            <div className="about-cta-button-group">
              <Link to="/store" className="about-shop-now-btn">
                <span>Shop Now</span>
                <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default About;
