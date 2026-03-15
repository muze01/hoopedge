import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const country =
    req.headers.get("x-vercel-ip-country") ??
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
