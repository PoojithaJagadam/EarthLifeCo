import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, ArrowRight } from 'lucide-react';
import Container from '../../components/UI/Container/Container';
import neemWoodImg from '../../assets/images/why_neem_wood_1790188473055.jpg';
import bambooImg from '../../assets/images/why_bamboo_1790188487943.jpg';
import coconutCoirImg from '../../assets/images/why_coconut_coir_1790188499889.jpg';
import sproutHandsImg from '../../assets/images/why_sprout_hands_1790188514691.jpg';
import heroLeafImg from '../../assets/hero_leaf_transparent.png';
import heroProductsImg from '../../assets/hero_products_mobile.png';
import './WhyNatural.css';

const WhyNatural = () => {
  return (
    <div className="why-natural-page">
      {/* Hero Section with panoramic hero background & decorative green leaves */}
      <section className="why-hero-section" aria-label="Why Natural Introduction">
        <img 
          src={heroLeafImg} 
          alt="" 
          aria-hidden="true" 
          className="why-hero-leaf-topleft" 
        />
        <Container>
          <div className="why-hero-grid">
            <div className="why-hero-text">
              <nav className="why-hero-breadcrumb" aria-label="Breadcrumb">
                <Link to="/" className="breadcrumb-link">Home</Link>
                <span className="breadcrumb-arrow" aria-hidden="true">&gt;</span>
                <span className="breadcrumb-current">Why Natural?</span>
              </nav>

              <h1 className="why-hero-title">Why Natural?</h1>
              <h2 className="why-hero-subtitle">
                Everyday choices for a cleaner, happier tomorrow.
              </h2>
              <p className="why-hero-desc">
                At EarthLife Co., we believe natural essentials shouldn't feel exclusive. We create thoughtfully designed everyday products using natural materials, timeless design and a premium experience — at prices that fit everyday homes.
              </p>
              <div className="why-hero-btn-wrap">
                <Link to="/store" className="why-primary-btn">
                  <span>Shop Natural Products</span>
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>

            <div className="why-hero-badge-col">
              <div className="why-visual-stage">
                <img 
                  src={heroProductsImg} 
                  alt="EarthLife Co. Natural Essentials Collection" 
                  className="why-hero-img" 
                  loading="eager"
                />
                <div className="why-hero-cursive-badge">
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

      {/* Materials Section */}
      <section className="why-materials-section">
        <Container>
          <div className="why-materials-header">
            <span className="why-section-tag">NATURAL MATERIALS. THOUGHTFULLY CHOSEN</span>
            <h2 className="why-section-heading">Good Materials Make a Difference.</h2>
            <p className="why-section-desc">We use simple, natural materials to create products for your everyday life.</p>
          </div>

          <div className="why-materials-grid">
            {/* 1. Neem Wood */}
            <div className="why-material-card">
              <div className="why-material-img-wrap">
                <img 
                  src={neemWoodImg} 
                  alt="Neem wood comb with fresh green neem leaves" 
                  className="why-material-img" 
                />
              </div>
              <div className="why-material-body">
                <h3 className="why-material-title">Neem Wood</h3>
                <p className="why-material-text">
                  Neem wood is a traditional, natural material we use to create everyday essentials like combs that are simple, durable and better for your daily routine.
                </p>
              </div>
            </div>

            {/* 2. Bamboo */}
            <div className="why-material-card">
              <div className="why-material-img-wrap">
                <img 
                  src={bambooImg} 
                  alt="Sustainable bamboo toothbrushes" 
                  className="why-material-img" 
                />
              </div>
              <div className="why-material-body">
                <h3 className="why-material-title">Bamboo</h3>
                <p className="why-material-text">
                  Bamboo is a fast-growing, versatile plant that's widely used for everyday products. Our bamboo essentials, like toothbrushes, bring you a simple, natural alternative for modern living.
                </p>
              </div>
            </div>

            {/* 3. Coconut Coir */}
            <div className="why-material-card">
              <div className="why-material-img-wrap">
                <img 
                  src={coconutCoirImg} 
                  alt="Organic coconut coir dish scrub pads" 
                  className="why-material-img" 
                />
              </div>
              <div className="why-material-body">
                <h3 className="why-material-title">Coconut Coir</h3>
                <p className="why-material-text">
                  Coconut coir is a natural fibre derived from coconut husks. We use it to create scrub pads that are tough on everyday cleaning needs, yet a more natural choice for your home.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Small Choices Banner Section */}
      <section className="why-banner-section">
        <Container>
          <div className="why-banner-card">
            <div className="why-banner-grid">
              <div className="why-banner-media">
                <img 
                  src={sproutHandsImg} 
                  alt="Caring hands holding soil and a growing green seedling" 
                  className="why-banner-img" 
                />
              </div>
              <div className="why-banner-content">
                <h2 className="why-banner-title">Small Choices. A Bigger Tomorrow.</h2>
                <p className="why-banner-desc">
                  Choosing natural, sustainable products is a simple way to make everyday living a little more natural — for cleaner homes, happier families and a brighter tomorrow.
                </p>
                <div className="why-banner-btn-wrap">
                  <Link to="/store" className="why-primary-btn">
                    <span>Explore Our Store</span>
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>

            <img 
              src={heroLeafImg} 
              alt="" 
              aria-hidden="true" 
              className="why-banner-leaf-deco" 
            />
          </div>
        </Container>
      </section>

      {/* Mission & Vision Section */}
      <section className="why-mv-section">
        <Container>
          <div className="why-mv-grid">
            {/* Mission */}
            <div className="why-mv-card">
              <div className="why-mv-icon-wrap">
                <Leaf size={28} className="why-mv-icon" />
              </div>
              <div className="why-mv-text-group">
                <span className="why-section-tag">OUR MISSION</span>
                <h3 className="why-mv-title">Making Natural Living More Accessible</h3>
                <p className="why-mv-desc">
                  Our mission is to make thoughtfully designed everyday products more accessible, combining carefully selected natural materials, timeless design, and a premium experience at prices that fit everyday homes.
                </p>
              </div>
            </div>

            {/* Vision */}
            <div className="why-mv-card">
              <div className="why-mv-icon-wrap">
                <Leaf size={28} className="why-mv-icon" />
              </div>
              <div className="why-mv-text-group">
                <span className="why-section-tag">OUR VISION</span>
                <h3 className="why-mv-title">A Natural Choice for Every Home</h3>
                <p className="why-mv-desc">
                  Our vision is for thoughtfully made everyday essentials to become a natural choice for every home, combining quality, timeless design and carefully selected natural materials.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
};

export default WhyNatural;
