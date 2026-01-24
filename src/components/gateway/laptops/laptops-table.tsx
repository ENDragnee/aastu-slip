import { format } from "date-fns";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/common/empty-state";
import { LaptopRecord } from "@/types/laptop";

export function LaptopsTable({ data }: { data: LaptopRecord[] }) {
  return (
    <div className="hidden md:block border rounded-lg bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Student</TableHead>
            <TableHead>Device Info</TableHead>
            <TableHead>Serial Number</TableHead>
            <TableHead>Registered At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-48">
                <EmptyState title="No laptops found" description="Adjust filters or register a new device." />
              </TableCell>
            </TableRow>
          ) : data.map((laptop) => (
            <TableRow key={laptop.id} className="hover:bg-muted/30">
              <TableCell>
                <div className="font-medium">{laptop.user.name}</div>
                <div className="text-xs text-muted-foreground font-mono">{laptop.user.universityId}</div>
              </TableCell>
              <TableCell>
                <span className="font-medium">{laptop.manufacturer}</span> <span className="text-muted-foreground">{laptop.model}</span>
              </TableCell>
              <TableCell className="font-mono text-sm">{laptop.serialNumber}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {format(new Date(laptop.createdAt), "MMM dd, yyyy")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
