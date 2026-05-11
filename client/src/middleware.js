import { NextResponse } from "next/server";

const SELLER_INTENT_COOKIE = "agriculnet_seller_intent";

/**
 * DevTools / bundler quirks that otherwise spam the terminal & Network tab:
 * - Chrome probes /.well-known/.../com.chrome.devtools.json
 * - Browsers request Framer Motion LayoutGroupContext.mjs.map URLs that webpack does not emit
 *
 * Seller registration: only after visiting /sell/onboarding (sets cookie) or ?from=sell
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.includes("/.well-known/appspecific/com.chrome.devtools.json")) {
    return NextResponse.json({}, { headers: { "cache-control": "public, max-age=3600" } });
  }

  if (pathname.includes("LayoutGroupContext.mjs.map")) {
    return new NextResponse(null, { status: 204 });
  }

  if (pathname === "/register/farmer" || pathname === "/register/reseller") {
    const hasCookie = request.cookies.get(SELLER_INTENT_COOKIE)?.value === "1";
    const fromSell = request.nextUrl.searchParams.get("from") === "sell";
    if (!hasCookie && !fromSell) {
      return NextResponse.redirect(new URL("/sell/onboarding", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/.well-known/:path*",
    "/_next/static/chunks/:path*",
    "/register/farmer",
    "/register/reseller",
  ],
};
