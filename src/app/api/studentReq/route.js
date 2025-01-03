import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function POST(request) {
  try {
    const { studentId, name, dorm, block, items } = await request.json();
    const [rows] = await db.execute(
      "SELECT * FROM Exits WHERE StudentId = ? ORDER BY id DESC LIMIT 1",
      [studentId]
    );

    // Validate the incoming data
    if (!studentId || !name || !dorm || !block || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'All fields are required, and items must be a non-empty array.' },
        { status: 400 }
      );
    }

    // Convert items to JSON string for database storage
    const itemsJson = JSON.stringify(items);

    if (rows.length > 0 && rows[0].Status !== 'Exited') {
      return NextResponse.json(
        { error: `The student with ID '${studentId}' has not exited.` },
        { status: 409 }
      );
    }

    // Insert the request into the database
    await db.execute(
      `
      INSERT INTO Exits (StudentId, Name, Dorm, Block, Items)
      VALUES (?, ?, ?, ?, ?)
      `,
      [studentId, name, dorm, block, itemsJson]
    );

    return NextResponse.json({
      success: true,
      message: 'Request added successfully',
    });
    
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      // Handle duplicate entry error
      return NextResponse.json(
        { error: `A request with StudentId '${error.sqlMessage.match(/'(.+)'/)[1]}' already exists.` },
        { status: 409 }
      );
    }

    console.error('Error adding request:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
}
