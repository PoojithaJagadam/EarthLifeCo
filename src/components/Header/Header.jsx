import React, { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Search, User, ShoppingCart, Menu, X, ArrowRight, HelpCircle } from 'lucide-react';
import Container from '../UI/Container/Container';
import logoImg from '../../assets/logo.png';
import RandomLetterSwap from '../UI/RandomLetterSwap/RandomLetterSwap';
import { useCart } from '../../context/CartContext';
import { useEcwidAccount } from '../../hooks/useEcwidAccount';
import './Header.css';

const Header = () => {
  const { cartCount } = useCart();
  const { isLoggedIn, customer } = useEcwidAccount();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const location = useLocation();
  const [prevPath, setPrevPath] = useState(location.pathname);

  // Close mobile menu on route change cleanly during render
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  }

  // Handle ESC key and scroll lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <header className="header">
      <Container className="header-main">
        <div className="logo">
          <Link to="/" onClick={() => setIsMenuOpen(false)} aria-label="EarthLife Co. Home">
            <img src={logoImg} alt="EarthLife Co. Logo" className="header-logo-img" />
          </Link>
        </div>
        
        <nav className="nav-links desktop-nav" aria-label="Main Navigation">
          <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
            <RandomLetterSwap text="Home" staggerDuration={0.025} duration={0.45} />
          </NavLink>
          <NavLink to="/store" className={({ isActive }) => (isActive ? 'active' : '')}>
            <RandomLetterSwap text="Store" staggerDuration={0.025} duration={0.45} />
          </NavLink>
          <NavLink to="/why-natural" className={({ isActive }) => (isActive ? 'active' : '')}>
            <RandomLetterSwap text="Why Natural?" staggerDuration={0.025} duration={0.45} />
          </NavLink>
          <NavLink to="/about" className={({ isActive }) => (isActive ? 'active' : '')}>
            <RandomLetterSwap text="About EarthLife Co." staggerDuration={0.02} duration={0.45} />
          </NavLink>
          <NavLink to="/faqs" className={({ isActive }) => (isActive ? 'active' : '')}>
            <RandomLetterSwap text="FAQs" staggerDuration={0.025} duration={0.45} />
          </NavLink>
          <NavLink to="/contact" className={({ isActive }) => (isActive ? 'active' : '')}>
            <RandomLetterSwap text="Contact" staggerDuration={0.025} duration={0.45} />
          </NavLink>
        </nav>
        
        <div className="header-actions">
          <Link to="/store#!/~/search" className="icon-btn search-btn" aria-label="Search" title="Search">
            <Search size={20} />
          </Link>
          <div className="support-dropdown" style={{position: 'relative'}}>
            <button className="icon-btn support-btn" title="Support" onClick={() => setIsSupportOpen(!isSupportOpen)}>
              <HelpCircle size={20} />
            </button>
            {isSupportOpen && (
              <div className="support-menu" style={{position: 'absolute', right: 0, top: '100%', background: 'white', border: '1px solid #ddd', padding: '10px', borderRadius: '8px', zIndex: 10}} onClick={() => setIsSupportOpen(false)}>
                <Link to="/cancellation-request" style={{display: 'block', padding: '5px 0', textDecoration: 'none', color: 'black'}}>Cancel Order</Link>
                <Link to="/contact" style={{display: 'block', padding: '5px 0', textDecoration: 'none', color: 'black'}}>Contact Us</Link>
              </div>
            )}
          </div>
          <Link 
            to="/account" 
            className="icon-btn account-btn" 
            aria-label={isLoggedIn ? `Account (${customer?.name || customer?.email})` : "Account"}
            title={isLoggedIn ? `Signed in as ${customer?.name || customer?.email}` : "Account"}
          >
            <User size={20} />
            {isLoggedIn && <span className="account-logged-in-indicator" />}
          </Link>
          <Link to="/cart" className="icon-btn cart-btn" aria-label="Cart" id="header-cart-btn" title="Shopping Cart">
            <ShoppingCart size={20} />
            <span className="cart-badge">{cartCount}</span>
          </Link>

          <button
            type="button"
            className="icon-btn hamburger-btn"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-nav-drawer"
            aria-label={isMenuOpen ? "Close menu" : "Open navigation menu"}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </Container>

      {/* Accessible Mobile & Tablet Navigation Menu */}
      <div 
        id="mobile-nav-drawer" 
        className={`mobile-nav-drawer ${isMenuOpen ? 'open' : ''}`}
        aria-hidden={!isMenuOpen}
      >
        <div 
          className="mobile-nav-backdrop" 
          onClick={() => setIsMenuOpen(false)} 
          aria-hidden="true"
        />
        <div className="mobile-nav-panel">
          <nav className="mobile-nav-links" aria-label="Mobile Navigation">
            <NavLink 
              to="/" 
              end 
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} 
              onClick={() => setIsMenuOpen(false)}
            >
              <span>Home</span>
              <ArrowRight size={16} className="mobile-nav-arrow" />
            </NavLink>
            <NavLink 
              to="/store" 
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} 
              onClick={() => setIsMenuOpen(false)}
            >
              <span>Store</span>
              <ArrowRight size={16} className="mobile-nav-arrow" />
            </NavLink>
            <NavLink 
              to="/why-natural" 
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} 
              onClick={() => setIsMenuOpen(false)}
            >
              <span>Why Natural?</span>
              <ArrowRight size={16} className="mobile-nav-arrow" />
            </NavLink>
            <NavLink 
              to="/about" 
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} 
              onClick={() => setIsMenuOpen(false)}
            >
              <span>About</span>
              <ArrowRight size={16} className="mobile-nav-arrow" />
            </NavLink>
            <NavLink 
              to="/faqs" 
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} 
              onClick={() => setIsMenuOpen(false)}
            >
              <span>FAQs</span>
              <ArrowRight size={16} className="mobile-nav-arrow" />
            </NavLink>
            <NavLink 
              to="/contact" 
              className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`} 
              onClick={() => setIsMenuOpen(false)}
            >
              <span>Contact</span>
              <ArrowRight size={16} className="mobile-nav-arrow" />
            </NavLink>
          </nav>

          <div className="mobile-nav-footer">
            <div className="mobile-nav-shortcuts">
              <Link to="/store#!/~/search" className="mobile-shortcut-btn" onClick={() => setIsMenuOpen(false)}>
                <Search size={18} />
                <span>Search</span>
              </Link>
              <Link to="/account" className="mobile-shortcut-btn" onClick={() => setIsMenuOpen(false)}>
                <User size={18} />
                <span>{isLoggedIn ? (customer?.name?.split(' ')[0] || 'Account') : 'Account'}</span>
              </Link>
              <Link to="/cart" className="mobile-shortcut-btn" onClick={() => setIsMenuOpen(false)}>
                <ShoppingCart size={18} />
                <span>Cart ({cartCount})</span>
              </Link>
            </div>
            <p className="mobile-nav-tagline">
              Natural everyday essentials crafted from Neem wood, bamboo, and coconut coir.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
