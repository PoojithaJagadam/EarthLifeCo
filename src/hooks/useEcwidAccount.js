import { useState, useEffect, useCallback } from 'react';
import {
  getCurrentEcwidCustomer,
  subscribeToEcwidCustomer,
  openEcwidAccountPage,
  signoutEcwidCustomer,
  updateCustomerProfile
} from '../ecwid/account/ecwidAccount';

export function useEcwidAccount() {
  const [customer, setCustomer] = useState(() => getCurrentEcwidCustomer());
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(() => {
    const cust = getCurrentEcwidCustomer();
    setCustomer(cust);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Subscribe to Ecwid customer session changes (sign in, sign out, profile update)
    const unsubscribe = subscribeToEcwidCustomer((cust) => {
      setCustomer(cust);
      setIsLoading(false);
    });

    // Timeout safety for initial load
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1200);

    return () => {
      clearTimeout(timer);
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const openPage = useCallback((page) => {
    openEcwidAccountPage(page);
  }, []);

  const logout = useCallback((onComplete) => {
    signoutEcwidCustomer(() => {
      setCustomer(null);
      if (typeof onComplete === 'function') onComplete();
    });
  }, []);

  const updateProfile = useCallback(async (params) => {
    return await updateCustomerProfile(params);
  }, []);

  return {
    customer,
    isLoggedIn: Boolean(customer && (customer.email || customer.id)),
    isLoading,
    openPage,
    logout,
    refresh,
    updateProfile
  };
}

export default useEcwidAccount;
