import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * /cart route: Safely directs customer to Ecwid shopping cart on /checkout#!/~/cart
 */
const Cart = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/checkout#!/~/cart', { replace: true });
  }, [navigate]);

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FBF9F5' }}>
      <p style={{ color: '#1E3A2B', fontFamily: 'var(--font-heading, Outfit, sans-serif)', fontSize: '1.1rem' }}>
        Opening your shopping cart...
      </p>
    </div>
  );
};

export default Cart;
