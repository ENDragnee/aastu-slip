import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { AdminEventRecord } from "@/types/events";

export function EventsMobileList({ data }: { data: AdminEventRecord[] }) {
  if (data.length === 0) return <div className="md:hidden"><EmptyState /></div>;

  return (
    <div className="grid grid-cols-1 gap-4 md:hidden">
      {data.map((record) => (
        <Card key={record.id} className="shadow-sm border-l-4 border-l-secondary/50">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="space-y-1">
              <div className="font-medium">{record.exit.student.name}</div>
              <div className="text-xs text-muted-foreground font-mono">
                {record.exit.student.universityId}
              </div>
            </div>
            <StatusBadge status={record.status} />
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="flex justify-between text-muted-foreground">
              <span>Time:</span>
              <span>{format(new Date(record.at), "PP p")}</span>
            </div>
            {record.note && (
              <div className="bg-muted/50 p-2 rounded text-xs italic">
                "{record.note}"
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
