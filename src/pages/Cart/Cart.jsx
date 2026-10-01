import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEcwidAccount } from '../../hooks/useEcwidAccount';

/**
 * /cart route: Directs customer to Ecwid shopping cart on /checkout#!/~/cart for logged-in users,
 * or /account?redirect=cart for logged-out users to sign in first.
 */
const Cart = () => {
  const navigate = useNavigate();
  const { isLoggedIn, isLoading } = useEcwidAccount();

  useEffect(() => {
    if (!isLoading) {
      if (isLoggedIn) {
        navigate('/checkout#!/~/cart', { replace: true });
      } else {
        navigate('/account?redirect=cart', { replace: true });
      }
    }
  }, [isLoggedIn, isLoading, navigate]);

  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FBF9F5' }}>
      <p style={{ color: '#1E3A2B', fontFamily: 'var(--font-heading, Outfit, sans-serif)', fontSize: '1.1rem' }}>
        Opening your shopping cart...
      </p>
    </div>
  );
};

export default Cart;
