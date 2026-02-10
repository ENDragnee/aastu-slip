import { format } from "date-fns";
import { MoreHorizontal, Eye } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { AdminRequestRecord } from "@/types/admin";

interface RequestsTableProps {
  data: AdminRequestRecord[];
  onViewDetails: (req: AdminRequestRecord) => void;
}

export function RequestsTable({ data, onViewDetails }: RequestsTableProps) {
  return (
    <div className="hidden md:block border rounded-lg bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Exit Code</TableHead>
            <TableHead>Student</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-48">
                <EmptyState title="No requests found" />
              </TableCell>
            </TableRow>
          ) : data.map((req) => (
            <TableRow key={req.id} className="hover:bg-muted/30">
              <TableCell className="font-mono font-medium">#{req.exitCode}</TableCell>
              <TableCell>
                <div className="font-medium">{req.student.name}</div>
                <div className="text-xs text-muted-foreground">{req.student.universityId}</div>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {req.laptops.length} Dev, {req.properties.length} Items
              </TableCell>
              <TableCell>
                <StatusBadge status={req.currentStatus} />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {format(new Date(req.createdAt), "MMM dd, HH:mm")}
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => onViewDetails(req)}>
                      <Eye className="mr-2 h-4 w-4" /> View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
