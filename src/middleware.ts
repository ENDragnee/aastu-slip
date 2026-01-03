import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const userId = request.cookies.get("userId");
  const userGate = request.cookies.get("userGate"); // Retrieve userGate from cookies
  const url = request.nextUrl.clone();

  if (!userId) {
    // Redirect to login page if not logged in
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/proctor/:path*"],
};
