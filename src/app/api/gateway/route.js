import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    const query = `
      SELECT id, gate 
      FROM GateUsers 
      WHERE username = ? AND password = ?
      LIMIT 1
    `;

    let rows = []; // Declare rows outside the inner try block
    try {
      const [result] = await db.execute(query, [username, password]);
      rows = result; // Assign result to rows
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { message: 'Database query failed', error: dbError.message },
        { status: 500 }
      );
    }

    if (rows.length === 0) {
      return NextResponse.json(
        { message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = rows[0];

    const response = NextResponse.json({
      message: 'Login successful',
      user: {
        id: user.id,
        gate: user.gate,
      },
    });

    // Set cookies via NextResponse
    response.cookies.set('userId', user.id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    response.cookies.set('userGate', user.gate, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Login failed' },
      { status: 500 }
    );
  }
}
