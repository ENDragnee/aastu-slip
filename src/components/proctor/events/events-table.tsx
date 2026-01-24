import { format } from "date-fns";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { EventRecord } from "@/types/proctor";

interface EventsTableProps {
  data: EventRecord[];
}

export function EventsTable({ data }: EventsTableProps) {
  return (
    <div className="hidden md:block border rounded-lg bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Action Taken</TableHead>
            <TableHead>Note</TableHead>
            <TableHead>Exit Code</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-48 text-center">
                <EmptyState title="No events found" description="No activity logs match your criteria." />
              </TableCell>
            </TableRow>
          ) : data.map((record) => (
            <TableRow key={record.id} className="hover:bg-muted/30">
              <TableCell>
                <div className="font-medium">{record.exit.student.name}</div>
                <div className="text-xs text-muted-foreground font-mono">
                  {record.exit.student.universityId}
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={record.status} />
              </TableCell>
              <TableCell className="max-w-[200px] truncate" title={record.note || ""}>
                {record.note ? (
                  <span className="text-sm">{record.note}</span>
                ) : (
                  <span className="text-muted-foreground italic text-xs">No note provided</span>
                )}
              </TableCell>
              <TableCell className="font-mono font-medium text-muted-foreground">
                {record.exit.exitCode}
              </TableCell>
              <TableCell className="text-muted-foreground whitespace-nowrap">
                {format(new Date(record.at), "MMM dd, HH:mm:ss")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
