// app/api/gate/finish/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const userToken = request.cookies.get('userGate');
    const exitedBy = userToken?.value || 'unknown';

    const { studentId } = await request.json();

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
      // First, get the Items from Requests table
      const getItemsQuery = `
        SELECT Items 
        FROM Requests 
        WHERE StudentId = ?
      `;
      const [itemsResult] = await connection.execute(getItemsQuery, [studentId]);
      
      if (!itemsResult || itemsResult.length === 0) {
        throw new Error('Request not found');
      }

      const items = itemsResult[0].Items;

      // Update Exit table with Items and other fields
      const updateExitQuery = `
        UPDATE Exits 
        SET 
          ExitDate = NOW(),
          ExitedBy = ?,
          Items = ?
        WHERE StudentId = ?
      `;
      await connection.execute(updateExitQuery, [exitedBy, items, studentId]);

      // Delete from Requests table
      const deleteRequestQuery = `
        DELETE FROM Requests 
        WHERE StudentId = ?
      `;
      await connection.execute(deleteRequestQuery, [studentId]);

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