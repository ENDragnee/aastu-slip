// app/api/requests/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';

export async function GET(request) {
  const searchParams = new URL(request.url).searchParams;
  const studentId = searchParams.get('studentId');

  try {
    const [rows] = await db.execute(
      'SELECT * FROM Requests WHERE StudentId = ?',
      [studentId]
    );
    
    if (rows.length === 0) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const proctorId = cookieStore.get('userId')?.value;

    if (!proctorId) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { studentId } = await request.json();
    const authorizedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const shortCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // First, update the request status
    await db.execute(
      `UPDATE Exits 
       SET ApprovedBy = ?, 
           ApprovalDate = ?
       WHERE StudentId = ?`,
      [proctorId, authorizedDate, studentId]
    );

    // Then, create a new exit record
    await db.execute(
      'INSERT INTO Exits (StudentId, ShortCode, ApprovedBy) VALUES (?, ?, ?)',
      [studentId, shortCode, proctorId]
    );

    return NextResponse.json({
      success: true,
      shortCode: shortCode
    });

  } catch (error) {
    console.error('Authorization error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}