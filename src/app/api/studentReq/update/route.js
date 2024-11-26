import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request) {
  let connection;
  try {
    connection = await db.getConnection();

    const { studentId, name, dorm, block, items } = await request.json();

    if (!studentId || !name || !dorm || !block || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "All fields are required, and items must be a non-empty array." },
        { status: 400 }
      );
    }

    const itemsJson = JSON.stringify(items);

    // Check if the record exists
    const [existingRecords] = await connection.execute(
      "SELECT COUNT(*) as count FROM Requests WHERE StudentId = ?",
      [studentId]
    );

    const recordExists = existingRecords[0].count > 0;

    if (!recordExists) {
      return NextResponse.json(
        { error: `No request found for StudentId '${studentId}'.` },
        { status: 404 }
      );
    }

    // Perform the update
    await connection.execute(
      `
      UPDATE Requests 
      SET Name = ?, Dorm = ?, Block = ?, Items = ?
      WHERE StudentId = ?
      `,
      [name, dorm, block, itemsJson, studentId]
    );

    return NextResponse.json({
      success: true,
      message: "Request updated successfully.",
    });
  } catch (error) {
    console.error("Error updating request:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again later." },
      { status: 500 }
    );
  } finally {
    if (connection) connection.release();
  }
}
