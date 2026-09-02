import type { UserRole } from '@/types';

export function hasRole(
  userRole: UserRole | undefined,
  allowedRoles: UserRole[]
) {
  if (!userRole) return false;

  return allowedRoles.includes(userRole);
}

export function isAdmin(role?: UserRole) {
  return role === 'admin';
}

export function isVendor(role?: UserRole) {
  return role === 'vendeur';
}

export function isClient(role?: UserRole) {
  return role === 'client';
}