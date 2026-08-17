import { NextRequest, NextResponse } from 'next/server';

const COOKIE_NAME = 'r2_gallery_auth';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const password = process.env.APP_PASSWORD || process.env.ADMIN_PASSWORD;

  // If no password configured, allow all access
  if (!password || !password.trim()) {
    return NextResponse.next();
  }

  // Allow auth endpoints, login page, and static resources
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/api/auth') ||
    pathname === '/login'
  ) {
    return NextResponse.next();
  }

  const expectedToken = Buffer.from(password.trim()).toString('base64');
  const token = request.cookies.get(COOKIE_NAME)?.value;

  if (token === expectedToken) {
    return NextResponse.next();
  }

  // If requesting an API route, return 401 Unauthorized
  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Redirect unauthenticated user to login page
  const loginUrl = new URL('/login', request.url);
  loginUrl.searchParams.set('redirect', pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
