import { redirect } from '@tanstack/react-router';
import { userManager } from '@/auth/oidc';
import { logError } from '@/utils/log';
import { UserRole } from './roles';
import { getRolesFromUser, userHasAllowedRole, userIsAdmin } from './utils';

export const requireAuthBeforeLoad = async () => {
  let user;
  try {
    // Small delay to allow React context to update after silent renewal
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 100);
    });

    // Force fresh user data from storage to get latest token state
    await userManager.clearStaleState();
    user = await userManager.getUser();

    console.log('[AuthGuard] User check:', {
      hasUser: !!user,
      userId: user?.profile?.sub,
      isExpired: user?.expired,
      expiresAt: user?.expires_at ? new Date(user.expires_at * 1000).toISOString() : 'unknown',
      scopes: user?.scope,
      accessToken: user?.access_token ? `${user.access_token.substring(0, 20)}...` : 'missing',
    });
  } catch (e) {
    console.error('[AuthGuard] Failed to get user from userManager:', e);
    logError('Auth guard failed to get user', e);
    // Only redirect if we truly can't get any user info
    console.log('[AuthGuard] Redirecting to sign-in due to user retrieval failure');
    throw redirect({ to: '/sign-in', replace: true });
  }

  if (!user) {
    console.log('[AuthGuard] No user found, redirecting to sign-in');
    throw redirect({ to: '/sign-in', replace: true });
  }

  // Allow access if token is expired but user has valid roles - let the app handle token refresh
  const roles = getRolesFromUser(user);
  const hasAccess = userHasAllowedRole(user);

  console.log('[AuthGuard] Role validation:', {
    userId: user.profile?.sub,
    userRoles: roles,
    hasAccess,
    requiredRoles: [UserRole.Admin, UserRole.Administrator, UserRole.Moderator, UserRole.Support],
    tokenExpired: user.expired,
  });

  if (!hasAccess) {
    console.warn('[AuthGuard] Insufficient roles for access, redirecting to sign-in');
    logError('Insufficient role for access', {
      roles,
      requiredRoles: [UserRole.Admin, UserRole.Administrator, UserRole.Moderator, UserRole.Support],
    });
    throw redirect({ to: '/sign-in', replace: true });
  }

  console.log('[AuthGuard] Authentication check passed');
};

export const requireAdminBeforeLoad = async () => {
  console.log('[AdminGuard] requireAdminBeforeLoad - Starting admin check');

  let user;
  try {
    console.log('[AdminGuard] Attempting to get user from userManager');
    // Small delay to allow React context to update after silent renewal
    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 100);
    });

    // Force fresh user data from storage to get latest token state
    await userManager.clearStaleState();
    user = await userManager.getUser();
    console.log('[AdminGuard] User retrieved:', {
      hasUser: !!user,
      userId: user?.profile?.sub,
      isExpired: user?.expired,
      expiresAt: user?.expires_at ? new Date(user.expires_at * 1000).toISOString() : 'unknown',
    });
  } catch (e) {
    console.error('[AdminGuard] Failed to get user from userManager:', e);
    logError('Admin guard failed to get user', e);
    // Only redirect if we truly can't get any user info
    console.log('[AdminGuard] Redirecting to sign-in due to user retrieval failure');
    throw redirect({ to: '/sign-in', replace: true });
  }

  const roles = getRolesFromUser(user);
  const isAdmin = userIsAdmin(user);

  console.log('[AdminGuard] Admin role validation:', {
    userId: user?.profile?.sub,
    userRoles: roles,
    isAdmin,
    requiredRoles: [UserRole.Admin, UserRole.Administrator],
    tokenExpired: user?.expired,
  });

  if (!isAdmin) {
    console.warn('[AdminGuard] Admin role required, redirecting to sign-in');
    logError('Admin role required', { roles });
    throw redirect({ to: '/sign-in', replace: true });
  }

  console.log('[AdminGuard] Admin check passed');
};

export const requireSupportOrAdminBeforeLoad = async () => {
  await requireAuthBeforeLoad();
};
