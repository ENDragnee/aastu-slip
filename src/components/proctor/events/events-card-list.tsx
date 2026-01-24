import { format } from "date-fns";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { EventRecord } from "@/types/proctor";

interface EventsCardListProps {
  data: EventRecord[];
}

export function EventsCardList({ data }: EventsCardListProps) {
  if (data.length === 0) {
    return (
      <div className="md:hidden border rounded-lg bg-card p-4">
        <EmptyState title="No events found" description="No activity logs match your criteria." />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:hidden">
      {data.map((record) => (
        <Card key={record.id} className="shadow-sm border-l-4 border-l-secondary">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="space-y-1">
              <div className="font-medium">{record.exit.student.name}</div>
              <div className="text-xs text-muted-foreground font-mono">
                {record.exit.student.universityId}
              </div>
            </div>
            <StatusBadge status={record.status} />
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm bg-muted/50 p-2 rounded">
              <span className="font-semibold text-xs text-muted-foreground uppercase tracking-wider block mb-1">
                Note
              </span>
              {record.note || <span className="italic text-muted-foreground">None</span>}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
              <span>Code: <span className="font-mono">{record.exit.exitCode}</span></span>
              <span>{format(new Date(record.at), "PP p")}</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
