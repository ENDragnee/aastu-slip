import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Fetch proctor from database
    const [rows] = await db.execute(
      'SELECT * FROM Proctors WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const proctor = rows[0];

    // Create response with cookies
    const response = NextResponse.json(
      { success: true },
      { status: 200 }
    );

    // Set cookies
    response.cookies.set('userId', proctor.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    response.cookies.set('userProc', 'proctor', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 // 24 hours
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}