import { useCallback } from 'react';
import useAuthStore from '@/store/authStore';
import { getAuthNextRoute, getRoleDashboard } from '@/lib/authRoutes';

const useAuth = () => {
  const store = useAuthStore();

  const isAdmin = store.user?.role === 'admin' || store.user?.role === 'super_admin';
  const isFarmer = store.user?.role === 'farmer';
  const isReseller = store.user?.role === 'reseller';
  const isSeller = isFarmer || isReseller;
  const isBuyer = ['local_buyer', 'international_buyer'].includes(store.user?.role);
  const isLocalBuyer = store.user?.role === 'local_buyer';
  const isInternationalBuyer = store.user?.role === 'international_buyer';

  const redirectToDashboard = useCallback(() => {
    if (!store.user) return '/';

    if (!store.user.email_verified) return getAuthNextRoute('verify_email', store.user);

    return getRoleDashboard(store.user);
  }, [store.user]);

  return {
    ...store,
    isAdmin,
    isFarmer,
    isReseller,
    isSeller,
    isBuyer,
    isLocalBuyer,
    isInternationalBuyer,
    redirectToDashboard
  };
};

export default useAuth;
