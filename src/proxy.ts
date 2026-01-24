import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const publicUrls = [
  "/",
  "/auth/sign-in",
  "/auth/sign-up",
  "/contact-us",
  "/about-us",
];

const authRoutes = ["/auth/sign-in", "/auth/sign-up"];

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request });
  const { pathname, search } = request.nextUrl;
  const isAuthRoute = authRoutes.includes(pathname);

  const isPublicUrl = publicUrls.includes(pathname);

  if (isPublicUrl) {
    return NextResponse.next();
  }

  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!token && !isPublicUrl) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("callbackUrl", pathname + search);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|webmanifest|xml|txt)$).*)",
  ],
};
