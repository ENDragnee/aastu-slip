import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shortcode = searchParams.get("shortcode") || "";
    const studentId = searchParams.get("studentId") || "";

    const query = `
      SELECT 
        r.StudentId,
        r.Name,
        e.ShortCode,
        r.DateOfRequest,
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
        r.DateOfRequest,
        r.Items
      LIMIT 1
    `;

    const [rows] = await db.execute(query, [shortcode, shortcode, studentId, studentId]);

    if (!rows || rows.length === 0) {
      return NextResponse.json({ message: "No student found" }, { status: 404 });
    }

    // Parse the JSON Items field
    const items = JSON.parse(rows[0].Items || "[]");

    // Aggregate quantities by item name
    const itemMap = items.reduce((acc, item) => {
      if (item.name && typeof item.quantity === 'number') {
        const currentCount = acc.get(item.name) || 0;
        acc.set(item.name, currentCount + item.quantity);
      }
      return acc;
    }, new Map());

    // Format the response
    const studentInfo = {
      name: rows[0].Name,
      studentId: rows[0].StudentId,
      shortcode: rows[0].ShortCode,
      DateOfRequest: rows[0].DateOfRequest,
      items: Array.from(itemMap).map(([name, quantity]) => ({
        name,
        count: quantity  // Using 'count' instead of 'quantity' to match the frontend
      }))
    };

    return NextResponse.json(studentInfo);
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      {
        message: "Database error",
        error: {
          code: error.code,
          message: error.sqlMessage || error.message,
        },
      },
      { status: 500 }
    );
  }
}