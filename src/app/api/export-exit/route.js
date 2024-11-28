import db from "@/lib/db";
import ExcelJS from "exceljs";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req) {
  const cookieStore = cookies();
  const proctorIdCookie = cookieStore.get("userId")?.value;
  const [row] = await db.execute(
    "SELECT username FROM Proctors WHERE id = ?",
    [proctorIdCookie]
  );

  try {
    if (!proctorIdCookie) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("start");
    const endDate = searchParams.get("end");

    // Base query and query parameters
    let query = "SELECT * FROM Exits WHERE ApprovedBy = ?";
    const queryParams = [row[0].username];

    // Add date range filter if `start` and `end` are provided
    if (startDate && endDate) {
      query += " AND ExitDate BETWEEN ? AND ?";
      queryParams.push(startDate, endDate);
    }

    // Query the database
    const [rows] = await db.query(query, queryParams);

    // Create a new workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Exits");

    // Define column headers based on the table structure
    worksheet.columns = [
      { header: "ID", key: "ID", width: 10 },
      { header: "Name", key: "Name", width: 10 },
      { header: "Student ID", key: "StudentId", width: 20 },
      { header: "Block", key: "Block", width: 10 },
      { header: "Dorm", key: "Dorm", width: 10 },
      { header: "Approved By", key: "ApprovedBy", width: 20 },
      { header: "Approval Date", key: "ApprovalDate", width: 20 },
      { header: "Items", key: "Items", width: 40 },
      { header: "Exit Date", key: "ExitDate", width: 20 },
      { header: "Exited By", key: "ExitedBy", width: 20 },
      { header: "Status", key: "Status", width: 20 },
    ];

    // Add rows from the database to the worksheet
    rows.forEach((row) => {
      // Format the `Items` column
      const formattedItems = (() => {
        try {
          const itemsArray = JSON.parse(row.Items || "[]");
          return itemsArray
            .map((item) => `${item.name}:${item.quantity}`)
            .join(", ");
        } catch {
          return row.Items || ""; // Return original value if parsing fails
        }
      })();

      worksheet.addRow({
        ID: row.ID,
        Name: row.Name,
        StudentId: row.StudentId,
        Block: row.Block,
        Dorm: row.Dorm,
        ApprovedBy: row.ApprovedBy || "",
        ApprovalDate: row.ApprovalDate
          ? new Date(row.ApprovalDate).toLocaleString()
          : "",
        Items: formattedItems,
        ExitDate: row.ExitDate ? new Date(row.ExitDate).toLocaleString() : "",
        ExitedBy: row.ExitedBy || "",
        Status: row.Status || "",
      });
    });

    // Generate the Excel file in-memory
    const buffer = await workbook.xlsx.writeBuffer();

    // Return the Excel file as a response
    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": 'attachment; filename="Exits.xlsx"',
      },
    });
  } catch (error) {
    console.error("Error exporting Exits table:", error);
    return new NextResponse("Failed to export Exits table", { status: 500 });
  }
}
