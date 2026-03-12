import { NextRequest, NextResponse } from "next/server";

/**
 * Reads the country Vercel automatically detects from the request IP
 * (`x-vercel-ip-country`) and forwards it as `x-user-country` so our
 * server components and API routes can read it without touching the
 * raw Vercel header directly.
 *
 * Falls back to "US" if the header is absent (local dev, unknown IP, etc.)
 *
 * This runs on ALL routes. If you already have a middleware file, merge
 * the country-forwarding logic into it rather than replacing it.
 */
export function middleware(req: NextRequest) {
  const country =
    req.headers.get("x-vercel-ip-country") ??
    // Allows overriding in local dev via a custom header for testing:
    // e.g. add `x-user-country: NG` in your HTTP client
    req.headers.get("x-user-country") ??
    "US";

  const response = NextResponse.next();
  response.headers.set("x-user-country", country);

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
