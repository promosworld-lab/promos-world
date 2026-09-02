import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const protectedRoutes = [
  '/dashboard',
  '/wallet',
  '/transactions',
  '/messages',
  '/profil',
  '/reservations',
  '/avis',
  '/litiges',
  '/acheter',
  '/reserver',
  '/chat',
  '/admin',
];

const authRoutes = ['/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some(
    (route) => pathname === route
  );

  /*
    IMPORTANT :
    La vraie vérification Supabase sera renforcée
    avec la configuration finale du client SSR.

    Ce middleware sert déjà à centraliser
    la protection des routes.
  */

  if (isAuthRoute) {
    return NextResponse.next();
  }

  if (isProtectedRoute) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/wallet/:path*',
    '/transactions/:path*',
    '/messages/:path*',
    '/profil/:path*',
    '/reservations/:path*',
    '/avis/:path*',
    '/litiges/:path*',
    '/acheter/:path*',
    '/reserver/:path*',
    '/chat/:path*',
    '/admin/:path*',
  ],
};