// app/api/gate/route.js
import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shortcode = searchParams.get('shortcode') || '';
    const studentId = searchParams.get('studentId') || '';

    const query = `
      SELECT 
        r.StudentId,
        r.Name,
        e.ShortCode,
        e.ExitDate,
        r.Items
      FROM 
        Requests r
      LEFT JOIN 
        Exits e ON r.StudentId = e.StudentId
      WHERE 
        (? = '' OR e.ShortCode = ?)
        AND
        (? = '' OR r.StudentId = ?)
      GROUP BY 
        r.StudentId,
        r.Name,
        e.ShortCode,
        e.ExitDate,
        r.Items
      LIMIT 1
    `;

    const [rows] = await db.execute(query, [shortcode, shortcode, studentId, studentId]);

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { message: 'No student found' },
        { status: 404 }
      );
    }

    // Parse the JSON Items field
    const items = JSON.parse(rows[0].Items || '[]');
    
    // Count items frequency based on test values
    const itemCounts = items.reduce((acc, item) => {
      const testValue = item.test;
      acc[testValue] = (acc[testValue] || 0) + 1;
      return acc;
    }, {});

    // Format the response
    const studentInfo = {
      name: rows[0].Name,
      studentId: rows[0].StudentId,
      shortcode: rows[0].ShortCode,
      exitDate: rows[0].ExitDate,
      items: Object.entries(itemCounts).map(([itemName, count]) => ({
        itemName: `Test ${itemName}`,
        count: parseInt(count)
      }))
    };

    return NextResponse.json(studentInfo);

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