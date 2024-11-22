// app/api/requests/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';

export async function GET(request) {
  const searchParams = new URL(request.url).searchParams;
  const studentId = searchParams.get("studentId");

  try {
    const [rows] = await db.execute(
      "SELECT StudentId, Name, DateOfRequest, Items FROM Requests WHERE StudentId = ?",
      [studentId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Parse the original items array
    const originalItems = JSON.parse(rows[0].Items);

    // Aggregate the quantities for each unique key
    const aggregatedItems = originalItems.reduce((acc, item) => {
      Object.entries(item).forEach(([key, value]) => {
        acc[key] = (acc[key] || 0) + value; // Add up quantities
      });
      return acc;
    }, {});

    const responseData = {
      StudentId: rows[0].StudentId,
      Name: rows[0].Name,
      DateOfRequest: rows[0].DateOfRequest,
      Items: aggregatedItems, // Aggregated items with quantities
    };

    return NextResponse.json(responseData);
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

export async function POST(request) {
  try {
    // Parse the request body
    const { studentId, name, dorm, block, items } = await request.json();

    // Validate the incoming data
    if (!studentId || !name || !dorm || !block || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request data' },
        { status: 400 }
      );
    }

    // Convert items to JSON string for database storage
    const itemsJson = JSON.stringify(items);

    // Insert the request into the database
    const [result] = await db.execute(
      `
      INSERT INTO Requests (StudentId, Name, Dorm, Block, Items)
      VALUES (?, ?, ?, ?, ?)
      `,
      [studentId, name, dorm, block, itemsJson]
    );

    // Respond with success and the inserted request ID
    return NextResponse.json({
      success: true,
      message: 'Request added successfully',
      requestId: result.insertId,
    });
  } catch (error) {
    console.error('Error adding request:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
