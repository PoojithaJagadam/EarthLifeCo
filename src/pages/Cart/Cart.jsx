import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEcwidAccount } from '../../hooks/useEcwidAccount';
import { getCurrentEcwidCustomer } from '../../ecwid/account/ecwidAccount';

/**
 * /cart route: Safely redirects customer according to authentication state.
 * - If logged in: directs to /checkout#!/~/cart
 * - If logged out: directs to /account#!/~/account (with return to /checkout#!/~/cart after login)
 * - Waits for Ecwid auth loading to resolve before deciding.
 */
const Cart = () => {
  const navigate = useNavigate();
  const { isLoggedIn, isLoading } = useEcwidAccount();

  useEffect(() => {
    let isMounted = true;

    const checkAndRedirect = async () => {
      let loggedIn = isLoggedIn;

      if (isLoading) {
        const current = getCurrentEcwidCustomer();
        if (current && (current.email || current.id)) {
          loggedIn = true;
        } else {
          loggedIn = await new Promise((resolve) => {
            let count = 0;
            const interval = setInterval(() => {
              count++;
              const cust = getCurrentEcwidCustomer();
              if (cust && (cust.email || cust.id)) {
                clearInterval(interval);
                resolve(true);
              } else if (count >= 10) {
                clearInterval(interval);
                resolve(false);
              }
            }, 100);
          });
        }
      }

      if (!isMounted) return;

      if (loggedIn) {
        navigate('/checkout#!/~/cart', { replace: true });
      } else {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('earthlife_post_login_redirect', '/checkout#!/~/cart');
        }
        navigate('/account#!/~/account', { state: { redirectTo: '/checkout#!/~/cart' }, replace: true });
      }
    };

    checkAndRedirect();

    return () => {
      isMounted = false;
    };
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
