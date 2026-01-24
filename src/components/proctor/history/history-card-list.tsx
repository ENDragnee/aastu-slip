import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { HistoryRecord } from "@/types/proctor";

interface HistoryCardListProps {
  data: HistoryRecord[];
}

export function HistoryCardList({ data }: HistoryCardListProps) {
  if (data.length === 0) {
    return (
      <div className="md:hidden border rounded-lg bg-card p-4">
        <EmptyState />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:hidden">
      {data.map((record) => (
        <Card key={record.id} className="shadow-sm border-l-4 border-l-primary/20">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-mono tracking-wider">
                {record.exitCode}
              </CardTitle>
              <div className="text-xs text-muted-foreground">
                {format(new Date(record.createdAt), "PP p")}
              </div>
            </div>
            <StatusBadge status={record.currentStatus} />
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1 text-muted-foreground">
              <div className="flex justify-between">
                <span>Name:</span>
                <span className="text-foreground font-medium">{record.student.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Student ID:</span>
                <span className="font-mono text-foreground">{record.student.universityId}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
