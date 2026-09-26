import React, { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Search, User, ShoppingCart, Menu, X, ArrowRight } from 'lucide-react';
import Container from '../UI/Container/Container';
import logoImg from '../../assets/logo.png';
import RandomLetterSwap from '../UI/RandomLetterSwap/RandomLetterSwap';
import { useCart } from '../../context/CartContext';
import { useEcwidAccount } from '../../hooks/useEcwidAccount';
import './Header.css';

const SUPPORT_PATHS = ['/faqs', '/contact', '/cancellation-request'];

const Header = () => {
  const { cartCount } = useCart();
  const { isLoggedIn, customer } = useEcwidAccount();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isMobileSupportOpen, setIsMobileSupportOpen] = useState(false);
  const supportDropdownRef = useRef(null);
  const location = useLocation();
  const [prevPath, setPrevPath] = useState(location.pathname);

  const isSupportActive = SUPPORT_PATHS.includes(location.pathname);

  // Close menus on route change cleanly during render
  if (prevPath !== location.pathname) {
    setPrevPath(location.pathname);
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
    if (isSupportOpen) {
      setIsSupportOpen(false);
    }
    if (isMobileSupportOpen) {
      setIsMobileSupportOpen(false);
    }
  }

  // Handle ESC key, outside click for desktop Support dropdown, and scroll lock for mobile drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsSupportOpen(false);
      }
    };

    const handlePointerDownOutside = (e) => {
      if (
        supportDropdownRef.current &&
        !supportDropdownRef.current.contains(e.target)
      ) {
        setIsSupportOpen(false);
      }
    };

    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handlePointerDownOutside);
    document.addEventListener('touchstart', handlePointerDownOutside);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handlePointerDownOutside);
      document.removeEventListener('touchstart', handlePointerDownOutside);
    };
  }, [isMenuOpen]);

  const handleSupportBlur = (e) => {
    if (
      supportDropdownRef.current &&
      !supportDropdownRef.current.contains(e.relatedTarget)
    ) {
      setIsSupportOpen(false);
    }
  };

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

          <div
            className={`nav-support-dropdown ${isSupportOpen ? 'open' : ''}`}
            ref={supportDropdownRef}
            onBlur={handleSupportBlur}
          >
            <button
              type="button"
              className={`nav-support-trigger ${isSupportActive || isSupportOpen ? 'active' : ''}`}
              onClick={() => setIsSupportOpen((prev) => !prev)}
              aria-expanded={isSupportOpen}
              aria-haspopup="menu"
              aria-controls="desktop-support-menu"
            >
              <RandomLetterSwap text="Support" staggerDuration={0.025} duration={0.45} />
              <span className={`nav-support-caret ${isSupportOpen ? 'open' : ''}`} aria-hidden="true">
                ▾
              </span>
            </button>

            <div
              id="desktop-support-menu"
              className={`nav-support-menu ${isSupportOpen ? 'open' : ''}`}
              role="menu"
              aria-label="Support submenu"
            >
              <NavLink
                to="/faqs"
                role="menuitem"
                className={({ isActive }) => `nav-support-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsSupportOpen(false)}
              >
                FAQs
              </NavLink>
              <NavLink
                to="/contact"
                role="menuitem"
                className={({ isActive }) => `nav-support-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsSupportOpen(false)}
              >
                Contact Us
              </NavLink>
              <NavLink
                to="/cancellation-request"
                role="menuitem"
                className={({ isActive }) => `nav-support-item ${isActive ? 'active' : ''}`}
                onClick={() => setIsSupportOpen(false)}
              >
                Cancel Order / Request Cancellation
              </NavLink>
            </div>
          </div>
        </nav>
        
        <div className="header-actions">
          <Link to="/store#!/~/search" className="icon-btn search-btn" aria-label="Search" title="Search">
            <Search size={20} />
          </Link>
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
              <span>About EarthLife Co.</span>
              <ArrowRight size={16} className="mobile-nav-arrow" />
            </NavLink>

            <div className="mobile-support-group">
              <button
                type="button"
                className={`mobile-nav-link mobile-support-trigger ${isSupportActive || isMobileSupportOpen ? 'active' : ''}`}
                onClick={() => setIsMobileSupportOpen((prev) => !prev)}
                aria-expanded={isMobileSupportOpen}
                aria-controls="mobile-support-submenu"
              >
                <span>Support</span>
                <span className={`mobile-support-caret ${isMobileSupportOpen ? 'open' : ''}`} aria-hidden="true">
                  ▾
                </span>
              </button>

              <div
                id="mobile-support-submenu"
                className={`mobile-support-submenu ${isMobileSupportOpen ? 'open' : ''}`}
                role="region"
                aria-label="Support links"
              >
                <NavLink
                  to="/faqs"
                  className={({ isActive }) => `mobile-support-sublink ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setIsMobileSupportOpen(false);
                    setIsMenuOpen(false);
                  }}
                >
                  <span>FAQs</span>
                  <ArrowRight size={14} className="mobile-nav-arrow" />
                </NavLink>
                <NavLink
                  to="/contact"
                  className={({ isActive }) => `mobile-support-sublink ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setIsMobileSupportOpen(false);
                    setIsMenuOpen(false);
                  }}
                >
                  <span>Contact Us</span>
                  <ArrowRight size={14} className="mobile-nav-arrow" />
                </NavLink>
                <NavLink
                  to="/cancellation-request"
                  className={({ isActive }) => `mobile-support-sublink ${isActive ? 'active' : ''}`}
                  onClick={() => {
                    setIsMobileSupportOpen(false);
                    setIsMenuOpen(false);
                  }}
                >
                  <span>Cancel Order / Request Cancellation</span>
                  <ArrowRight size={14} className="mobile-nav-arrow" />
                </NavLink>
              </div>
            </div>
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
