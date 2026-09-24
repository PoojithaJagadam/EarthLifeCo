import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import Home from './pages/Home/Home';
import Store from './pages/Store/Store';
import About from './pages/About/About';
import WhyNatural from './pages/WhyNatural/WhyNatural';
import FAQ from './pages/FAQ/FAQ';
import Contact from './pages/Contact/Contact';
import Cancellation from './pages/Cancellation/Cancellation';
import Account from './pages/Account/Account';
import ProductDetails from './pages/ProductDetails/ProductDetails';
import Cart from './pages/Cart/Cart';
import Checkout from './pages/Checkout/Checkout';

// Context
import { CartProvider } from './context/CartContext';

// Components
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import TrustBar from './components/TrustBar/TrustBar';

import './App.css';

function App() {
  return (
    <Router>
      <CartProvider>
        <div className="app-container">
          <TrustBar />
          <Header />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/store" element={<Store />} />
              <Route path="/product/:id" element={<ProductDetails />} />
              <Route path="/about" element={<About />} />
              <Route path="/why-natural" element={<WhyNatural />} />
              <Route path="/faqs" element={<FAQ />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/cancellation-request" element={<Cancellation />} />
              <Route path="/account" element={<Account />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </CartProvider>
    </Router>
  );
}

export default App;
