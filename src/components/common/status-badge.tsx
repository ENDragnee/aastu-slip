import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ExitStatus } from "@/generated/prisma/enums";

export function StatusBadge({ status }: { status: ExitStatus }) {
  const styles = {
    [ExitStatus.APPROVED]: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
    [ExitStatus.DENIED]: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
    [ExitStatus.EXITED]: "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100",
    [ExitStatus.REQUESTED]: "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-100",
  };

  return (
    <Badge variant="outline" className={cn("font-medium", styles[status])}>
      {status}
    </Badge>
  );
}
