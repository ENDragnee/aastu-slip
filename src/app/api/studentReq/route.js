import { NextResponse } from 'next/server';
import db from '@/lib/db';

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
  