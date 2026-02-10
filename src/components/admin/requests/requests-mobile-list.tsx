import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { AdminRequestRecord } from "@/types/admin";

export function RequestsMobileList({ data, onViewDetails }: { data: AdminRequestRecord[], onViewDetails: (r: AdminRequestRecord) => void }) {
  if (data.length === 0) return <div className="md:hidden"><EmptyState /></div>;

  return (
    <div className="grid grid-cols-1 gap-4 md:hidden">
      {data.map((req) => (
        <Card key={req.id} className="shadow-sm">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-mono">#{req.exitCode}</CardTitle>
              <div className="text-xs text-muted-foreground">{format(new Date(req.createdAt), "PP p")}</div>
            </div>
            <StatusBadge status={req.currentStatus} />
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <span className="block font-medium">{req.student.name}</span>
              <span className="text-muted-foreground">{req.student.universityId}</span>
            </div>
            <Button variant="outline" size="sm" className="w-full" onClick={() => onViewDetails(req)}>
              View Details
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
