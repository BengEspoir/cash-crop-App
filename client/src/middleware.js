import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import {
  getRoleHome,
  resolveAuthUserRole,
  shouldRedirectWorkspaceRoleFromMarketplace,
} from "./lib/roleRouting";

const SELLER_INTENT_COOKIE = "agriculnet_seller_intent";

/**
 * DevTools / bundler quirks that otherwise spam the terminal & Network tab:
 * - Chrome probes /.well-known/.../com.chrome.devtools.json
 * - Browsers request Framer Motion LayoutGroupContext.mjs.map URLs that webpack does not emit
 *
 * Seller registration: only after visiting /sell/onboarding (sets cookie) or ?from=sell
 */
const protectedNamespaces = {
  "/admin": ["admin", "super_admin"],
  "/farmer": ["farmer", "reseller"],
  "/buyer": ["local_buyer", "international_buyer"],
};

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.includes("/.well-known/appspecific/com.chrome.devtools.json")) {
    return NextResponse.json({}, { headers: { "cache-control": "public, max-age=3600" } });
  }

  if (pathname.includes("LayoutGroupContext.mjs.map")) {
    return new NextResponse(null, { status: 204 });
  }

  if (pathname === "/sign-in") {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const protectedEntry = Object.entries(protectedNamespaces)
    .find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  const checksMarketplaceRole = pathname === "/"
    || ["/browse", "/crops", "/farmers", "/find-farmers", "/request-quote", "/international", "/sell"]
      .some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (protectedEntry || checksMarketplaceRole) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user && protectedEntry) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (authData?.user) {
      const role = resolveAuthUserRole(authData.user);
      if (shouldRedirectWorkspaceRoleFromMarketplace(pathname, role)) {
        return NextResponse.redirect(new URL(getRoleHome(role), request.url));
      }

      if (protectedEntry) {
        const allowedRoles = protectedEntry[1];
        if (!role || !allowedRoles.includes(role)) {
          const roleHome = getRoleHome(role);
          return NextResponse.redirect(new URL(roleHome, request.url));
        }
      }
    }
  }

  if (pathname === "/register/farmer" || pathname === "/register/reseller") {
    const hasCookie = request.cookies.get(SELLER_INTENT_COOKIE)?.value === "1";
    const fromSell = request.nextUrl.searchParams.get("from") === "sell";
    if (!hasCookie && !fromSell) {
      return NextResponse.redirect(new URL("/sell/onboarding", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/.well-known/:path*",
    "/_next/static/chunks/:path*",
    "/register/farmer",
    "/register/reseller",
    "/sign-in",
    "/admin-portal",
    "/admin/:path*",
    "/buyer/:path*",
    "/farmer/:path*",
    "/",
    "/browse",
    "/crops/:path*",
    "/farmers/:path*",
    "/find-farmers",
    "/request-quote",
    "/international",
    "/sell/:path*",
  ],
};
