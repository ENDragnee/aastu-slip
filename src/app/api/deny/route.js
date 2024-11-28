import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId");

    if (!studentId) {
      return new NextResponse(
        JSON.stringify({ error: "Student ID is required" }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const connection = await db.getConnection();

    try {
      // First check if the request exists and its status
      const [rows] = await connection.execute(
        "SELECT Status FROM Exits WHERE StudentId = ?",
        [studentId]
      );

      if (rows.length === 0) {
        return new NextResponse(
          JSON.stringify({ error: "Request not found" }),
          {
            status: 404,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      if (rows[0].Status === 'Exited') {
        return new NextResponse(
          JSON.stringify({ error: "Cannot delete request that has already been exited" }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Delete the request if status is not 'Exited'
      const [result] = await connection.execute(
        "DELETE FROM Exits WHERE StudentId = ? AND Status != 'Exited'",
        [studentId]
      );

      if (result.affectedRows === 0) {
        return new NextResponse(
          JSON.stringify({ error: "Failed to delete request" }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      return new NextResponse(
        JSON.stringify({ message: "Request denied successfully" }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Error denying request:", error);
    return new NextResponse(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}