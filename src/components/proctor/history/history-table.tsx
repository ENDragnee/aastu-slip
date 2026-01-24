import { format } from "date-fns";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { HistoryRecord } from "@/types/proctor";

interface HistoryTableProps {
  data: HistoryRecord[];
}

export function HistoryTable({ data }: HistoryTableProps) {
  return (
    <div className="hidden md:block border rounded-lg bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Exit Code</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead>Last Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-48 text-center">
                <EmptyState />
              </TableCell>
            </TableRow>
          ) : data.map((record) => (
            <TableRow key={record.id} className="hover:bg-muted/30">
              <TableCell>
                <div className="font-medium">{record.student.name}</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {record.student.universityId}
                </div>
              </TableCell>
              <TableCell className="font-mono font-medium">{record.exitCode}</TableCell>
              <TableCell>
                <StatusBadge status={record.currentStatus} />
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(record.createdAt), "MMM dd, yyyy HH:mm")}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {format(new Date(record.updatedAt), "MMM dd, yyyy HH:mm")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
