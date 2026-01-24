import { FileText } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = "No records found",
  description = "Try adjusting your filters or search terms."
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center h-full">
      <div className="bg-muted p-3 rounded-full mb-3">
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-lg font-medium">{title}</p>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
