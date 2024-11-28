import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shortcode = searchParams.get("shortcode");
    const studentId = searchParams.get("studentId");

    // Check if both parameters are provided
    if (!shortcode || !studentId) {
      return NextResponse.json(
        { message: "Both shortcode and student ID are required" },
        { status: 400 }
      );
    }

    const query = `
      SELECT 
        StudentId,
        Name,
        Block,
        Dorm,
        ApprovedBy,
        DateOfRequest,
        Status,
        ShortCode,
        Items
      FROM 
        Exits
      WHERE 
        ShortCode = ?
        AND
        StudentId = ?
      GROUP BY 
        StudentId,
        Name,
        Block,
        Dorm,
        ApprovedBy,
        DateOfRequest,
        Status,
        ShortCode,
        Items
      LIMIT 1
    `;

    const [rows] = await db.execute(query, [shortcode, studentId]);

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
      studentId: rows[0].StudentId,
      name: rows[0].Name,
      block: rows[0].Block,
      dorm: rows[0].Dorm,
      approvedBy: rows[0].ApprovedBy,
      DateOfRequest: rows[0].DateOfRequest,
      status: rows[0].Status,
      shortcode: rows[0].ShortCode,
      items: Array.from(itemMap).map(([name, quantity]) => ({
        name,
        count: quantity
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