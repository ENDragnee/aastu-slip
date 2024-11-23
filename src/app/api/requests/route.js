// app/api/requests/route.js
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import db from '@/lib/db';

export async function GET(request) {
  const searchParams = new URL(request.url).searchParams;
  const studentId = searchParams.get("studentId");

  try {
    const [rows] = await db.execute(
      "SELECT StudentId, Name, DateOfRequest, Items, Status FROM Requests WHERE StudentId = ?",
      [studentId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Parse the original items array
    const originalItems = JSON.parse(rows[0].Items);

    // The items are already in the correct format, just aggregate quantities by name
    const itemMap = originalItems.reduce((acc, item) => {
      const currentQuantity = acc.get(item.name) || 0;
      acc.set(item.name, currentQuantity + item.quantity);
      return acc;
    }, new Map());

    // Convert to the desired format
    const formattedItems = Array.from(itemMap).map(([name, quantity]) => ({
      name,
      quantity
    }));

    // Construct the final response
    const responseData = {
      StudentId: rows[0].StudentId,
      Name: rows[0].Name,
      DateOfRequest: rows[0].DateOfRequest,
      Items: formattedItems,
      Status: rows[0].Status
    };

    return NextResponse.json(responseData);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const proctorIdCookie = cookieStore.get('userId')?.value;

    if (!proctorIdCookie) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch the username using proctorIdCookie
    const [proctorRows] = await db.execute(
      `SELECT username FROM Proctors WHERE ID = ?`,
      [proctorIdCookie]
    );

    if (proctorRows.length === 0) {
      return NextResponse.json(
        { message: 'Proctor not found' },
        { status: 404 }
      );
    }

    const proctorUsername = proctorRows[0].username;

    const { studentId } = await request.json();
    const authorizedDate = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const shortCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    // First, update the request status
    await db.execute(
      `UPDATE Exits 
       SET ApprovedBy = ?, 
           ApprovalDate = ?
       WHERE StudentId = ?`,
      [proctorUsername, authorizedDate, studentId]
    );
    await db.execute(
      `UPDATE Requests 
       SET Status = 'Authorized'
       WHERE StudentId = ? AND Status = 'Not-Authorized'`,
      [studentId]
    );

    // Then, create a new exit record
    await db.execute(
      'INSERT INTO Exits (StudentId, ShortCode, ApprovedBy) VALUES (?, ?, ?)',
      [studentId, shortCode, proctorUsername]
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

