import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

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

  if (pathname === "/sign-in" || pathname === "/admin-portal") {
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
  if (protectedEntry) {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const { data: appUser } = await supabase
      .from("users")
      .select("role")
      .eq("auth_user_id", authData.user.id)
      .single();
    const role = appUser?.role;
    const allowedRoles = protectedEntry[1];
    if (!role || !allowedRoles.includes(role)) {
      const roleHome = role === "admin" || role === "super_admin"
        ? "/admin/dashboard"
        : role === "farmer" || role === "reseller"
          ? "/farmer/dashboard"
          : "/buyer/dashboard";
      return NextResponse.redirect(new URL(roleHome, request.url));
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
  ],
};
