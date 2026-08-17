import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'r2_gallery_auth';

function getRequiredPassword(): string | null {
  const pwd = process.env.APP_PASSWORD || process.env.ADMIN_PASSWORD;
  return pwd ? pwd.trim() : null;
}

export async function GET() {
  const password = getRequiredPassword();
  if (!password) {
    return NextResponse.json({ isAuthenticated: true, authRequired: false });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  const isAuthenticated = token === Buffer.from(password).toString('base64');

  return NextResponse.json({ isAuthenticated, authRequired: true });
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const requiredPassword = getRequiredPassword();

    if (!requiredPassword) {
      return NextResponse.json({ success: true, message: 'Auth not required' });
    }

    if (password !== requiredPassword) {
      return NextResponse.json({ success: false, error: 'Неверный пароль' }, { status: 401 });
    }

    const token = Buffer.from(requiredPassword).toString('base64');
    const response = NextResponse.json({ success: true });
    
    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    return response;
  } catch {
    return NextResponse.json({ success: false, error: 'Ошибка сервера' }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}
