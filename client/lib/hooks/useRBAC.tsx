'use client';

import { useAuth } from './useAuth';

const ROLE_HIERARCHY: Record<string, number> = {
  CUSTOMER: 1,
  ARTISAN: 2,
  SELLER: 2,
  ADMIN: 3,
};

export function useRBAC() {
  const { user } = useAuth();

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    return user.role === role;
  };

  const hasMinimumRole = (minimumRole: string): boolean => {
    if (!user) return false;
    const userLevel = ROLE_HIERARCHY[user.role] || 0;
    const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0;
    return userLevel >= requiredLevel;
  };

  const isAdmin = user?.role === 'ADMIN';
  const isArtisan = user?.role === 'ARTISAN';
  const isSeller = user?.role === 'SELLER';
  const isCustomer = user?.role === 'CUSTOMER';
  const isProvider = isArtisan || isSeller;

  const isAccountActive = user?.accountStatus === 'ACTIVE' || !user?.accountStatus;
  const isAccountSuspended = user?.accountStatus === 'SUSPENDED';
  const isAccountBanned = user?.accountStatus === 'BANNED';

  // Feature permissions
  const can = {
    // Admin features
    accessAdminPanel: isAdmin,
    manageUsers: isAdmin,
    managePlatform: isAdmin,
    viewAllOrders: isAdmin,

    // Provider features
    createService: isProvider && isAccountActive,
    manageServices: isProvider && isAccountActive,
    acceptOrders: isProvider && isAccountActive,

    // Seller features
    createProduct: isSeller && isAccountActive,
    manageProducts: isSeller && isAccountActive,

    // Customer features
    placeOrder: !!user && isAccountActive,
    leaveReview: !!user && isAccountActive,
    sendMessages: !!user && isAccountActive,

    // Profile features
    editOwnProfile: !!user && isAccountActive,
    viewProfile: !!user,

    // Social features
    createPost: isProvider && isAccountActive,
    addComment: !!user && isAccountActive,
    likePost: !!user && isAccountActive,
  };

  return {
    user,
    hasRole,
    hasMinimumRole,
    isAdmin,
    isArtisan,
    isSeller,
    isCustomer,
    isProvider,
    isAccountActive,
    isAccountSuspended,
    isAccountBanned,
    can,
  };
}
