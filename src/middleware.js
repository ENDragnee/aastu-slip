import { NextResponse } from 'next/server';

export function middleware(request) {
  const userId = request.cookies.get('userId');
  const userGate = request.cookies.get('userGate'); // Retrieve userGate from cookies
  const url = request.nextUrl.clone();

  
  if (!userId) {
    // Redirect to login page if not logged in
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }
  
  // Protect the gateway page
  if (url.pathname.startsWith('/gateway') && userGate === '') {
    url.pathname = '/login'; // Redirect to an unauthorized page if necessary
    return NextResponse.redirect(url);
  }

  // Protect the proctor page
  if (url.pathname.startsWith('/proctor') && userGate === '') {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/gateway/:path*', '/proctor/:path*'],
};
