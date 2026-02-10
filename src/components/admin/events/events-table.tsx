import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { AdminEventRecord } from "@/types/events";
import { ExitStatus } from "@/generated/prisma/enums";

export function EventsTable({ data }: { data: AdminEventRecord[] }) {

  // Helper to determine who performed the action based on status
  const getActor = (record: AdminEventRecord) => {
    if (record.status === ExitStatus.REQUESTED) return "Student";
    if (record.status === ExitStatus.EXITED) return record.exit.gateUser?.name || "Gateway";
    return record.exit.proctor?.name || "Proctor";
  };

  return (
    <div className="hidden md:block border rounded-lg bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Performed By</TableHead>
            <TableHead>Note</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-48">
                <EmptyState title="No events found" description="Activity logs will appear here." />
              </TableCell>
            </TableRow>
          ) : data.map((record) => (
            <TableRow key={record.id} className="hover:bg-muted/30">
              <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                {format(new Date(record.at), "MMM dd, HH:mm:ss")}
              </TableCell>
              <TableCell>
                <div className="font-medium">{record.exit.student.name}</div>
                <div className="text-xs text-muted-foreground font-mono">{record.exit.student.universityId}</div>
              </TableCell>
              <TableCell>
                <StatusBadge status={record.status} />
                <div className="text-[10px] text-muted-foreground font-mono mt-1">
                  #{record.exit.exitCode}
                </div>
              </TableCell>
              <TableCell className="text-sm">
                {getActor(record)}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground italic max-w-[200px] truncate">
                {record.note || "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
