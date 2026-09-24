import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Search, User, ShoppingCart } from 'lucide-react';
import Container from '../UI/Container/Container';
import logoImg from '../../assets/logo.png';
import RandomLetterSwap from '../UI/RandomLetterSwap/RandomLetterSwap';
import { useCart } from '../../context/CartContext';
import { useEcwidAccount } from '../../hooks/useEcwidAccount';
import './Header.css';

const Header = () => {
  const { cartCount } = useCart();
  const { isLoggedIn, customer } = useEcwidAccount();

  return (
    <header className="header">
      <Container className="header-main">
        <div className="logo">
          <Link to="/">
            <img src={logoImg} alt="EarthLife Co. Logo" style={{ height: '50px' }} />
          </Link>
        </div>
        
        <nav className="nav-links hide-on-mobile">
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
          <Link to="/store#!/~/search" className="icon-btn" aria-label="Search"><Search size={20} /></Link>
          <Link 
            to="/account" 
            className="icon-btn account-btn" 
            aria-label={isLoggedIn ? `Account (${customer?.name || customer?.email})` : "Account"}
            title={isLoggedIn ? `Signed in as ${customer?.name || customer?.email}` : "Account"}
          >
            <User size={20} />
            {isLoggedIn && <span className="account-logged-in-indicator" />}
          </Link>
          <Link to="/cart" className="icon-btn cart-btn" aria-label="Cart" id="header-cart-btn">
            <ShoppingCart size={20} />
            <span className="cart-badge">{cartCount}</span>
          </Link>
        </div>
      </Container>
    </header>
  );
};

export default Header;
