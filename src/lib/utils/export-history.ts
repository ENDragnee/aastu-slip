import { format } from "date-fns";
import { HistoryRecord } from "@/types/proctor";

export const downloadHistoryCSV = (data: HistoryRecord[]) => {
  if (!data || data.length === 0) return;

  const headers = [
    "Exit Code",
    "Status",
    "Student Name",
    "Student ID",
    "Date Created",
    "Date Updated",
  ];
  const rows = data.map((row) => [
    row.exitCode,
    row.currentStatus,
    row.student.name,
    row.student.universityId,
    format(new Date(row.createdAt), "yyyy-MM-dd HH:mm:ss"),
    format(new Date(row.updatedAt), "yyyy-MM-dd HH:mm:ss"),
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `exit_history_${format(new Date(), "yyyy-MM-dd")}.csv`,
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
