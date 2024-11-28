// app/api/gate/finish/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const { studentId, exitedBy=null} = await request.json();

    if (!studentId) {
      return NextResponse.json(
        { message: 'Student ID is required' },
        { status: 400 }
      );
    }

    // Begin transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
      // Update Exit table setting ShortCode to null
      const updateExitQuery = `
        UPDATE Exits 
        SET 
          ExitDate = NOW(),
          ExitedBy = ?,
          ShortCode = '',
          Status = 'Exited'
        WHERE StudentId = ?
      `;
      await connection.execute(updateExitQuery, [exitedBy, studentId]);

      // Commit transaction
      await connection.commit();
      connection.release();

      return NextResponse.json({ message: 'Successfully finished request' });
    } catch (error) {
      // Rollback transaction on error
      await connection.rollback();
      connection.release();
      throw error;
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { 
        message: 'Database error',
        error: {
          code: error.code,
          message: error.sqlMessage || error.message
        }
      },
      { status: 500 }
    );
  }
}