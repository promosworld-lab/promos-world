import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const protectedRoutes = [
  "/dashboard", "/wallet", "/transactions", "/messages", "/profil", "/reservations",
  "/avis", "/litiges", "/acheter", "/reserver", "/chat", "/panier", "/favoris",
  "/notifications", "/adresses", "/admin", "/vendeur", "/publier", "/promouvoir",
];

const buyerOnlyRoutes = [
  "/wallet", "/transactions", "/reservations", "/avis", "/litiges", "/acheter", "/reserver",
  "/chat", "/panier", "/favoris", "/notifications", "/adresses",
];

const sellerOnlyRoutes = ["/vendeur", "/dashboard", "/publier", "/promouvoir"];

function matches(pathname: string, route: string) {
  return pathname === route || pathname.startsWith(`${route}/`);
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;
  const isProtected = protectedRoutes.some((route) => matches(pathname, route));

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  if (user && isProtected) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    const role = profile?.role;
    const isBuyerOnly = buyerOnlyRoutes.some((route) => matches(pathname, route));
    const isSellerOnly = sellerOnlyRoutes.some((route) => matches(pathname, route));
    const isAdminRoute = matches(pathname, "/admin");

    if (isAdminRoute && role !== "admin") {
      return NextResponse.redirect(new URL(role === "vendeur" ? "/vendeur/dashboard" : "/", request.url));
    }
    if (isSellerOnly && role !== "vendeur") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (isBuyerOnly && role !== "client") {
      return NextResponse.redirect(new URL(role === "vendeur" ? "/vendeur/dashboard" : "/", request.url));
    }
  }

  if (pathname === "/auth" && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*", "/wallet/:path*", "/transactions/:path*", "/messages/:path*", "/profil/:path*",
    "/reservations/:path*", "/avis/:path*", "/litiges/:path*", "/acheter/:path*", "/reserver/:path*",
    "/chat/:path*", "/panier/:path*", "/favoris/:path*", "/notifications/:path*", "/adresses/:path*",
    "/vendeur/:path*", "/publier/:path*", "/promouvoir/:path*", "/admin/:path*", "/auth",
  ],
};
