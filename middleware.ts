import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const VALIDATE_URL = 'http://localhost/gprocalc/servidor/validate_session.php';
const LOGIN_URL = '/gprocalc/inicio.php';

export async function middleware(request: NextRequest) {
  const phpsessid = request.cookies.get('PHPSESSID')?.value;

  if (!phpsessid) {
    return NextResponse.redirect(new URL(LOGIN_URL, request.url));
  }

  try {
    const res = await fetch(VALIDATE_URL, {
      headers: { Cookie: `PHPSESSID=${phpsessid}` },
      cache: 'no-store',
    });
    if (!res.ok) {
      return NextResponse.redirect(new URL(LOGIN_URL, request.url));
    }
  } catch {
    return NextResponse.redirect(new URL(LOGIN_URL, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/gprocalc/dashboard/((?!_next/static|_next/image|favicon.ico).*)',
    '/gprocalc/dashboard',
  ],
};
