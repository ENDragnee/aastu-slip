import { format } from "date-fns";
import { Package, Laptop, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { StatusBadge } from "@/components/common/status-badge";
import { StudentRequestItem } from "@/types/student";

interface RequestListProps {
  data: StudentRequestItem[];
  onItemClick: (item: StudentRequestItem) => void;
}

export function RequestList({ data, onItemClick }: RequestListProps) {
  if (data.length === 0) {
    return (
      <div className="border rounded-lg bg-card p-8">
        <EmptyState
          title="No requests found"
          description="You haven't made any exit requests yet, or no results matched your search."
        />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {data.map((req) => (
        <Card
          key={req.id}
          className="group hover:shadow-md transition-all cursor-pointer border-l-4 border-l-primary/10 hover:border-l-primary"
          onClick={() => onItemClick(req)}
        >
          <CardContent className="p-4 sm:p-5 flex items-center justify-between gap-4">

            {/* Left Content */}
            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-lg font-bold tracking-wider text-primary">
                  #{req.exitCode}
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline">
                  • {format(new Date(req.createdAt), "MMM d, yyyy")}
                </span>
              </div>

              {/* Items Summary */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                {req.laptops.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Laptop className="h-3.5 w-3.5" />
                    <span>{req.laptops.length} Device{req.laptops.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {req.properties.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5" />
                    <span>{req.properties.length} Item{req.properties.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {req.laptops.length === 0 && req.properties.length === 0 && (
                  <span className="italic text-xs">No items declared</span>
                )}
              </div>

              {/* Mobile Date (shown below on small screens) */}
              <div className="text-xs text-muted-foreground sm:hidden pt-1">
                {format(new Date(req.createdAt), "PPP p")}
              </div>
            </div>

            {/* Right Content */}
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={req.currentStatus} />
              <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
            </div>

          </CardContent>
        </Card>
      ))}
    </div>
  );
}
