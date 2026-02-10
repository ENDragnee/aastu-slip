import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GateStat } from "@/types/admin";
import { GateStatus } from "@/generated/prisma/enums";

export function GateStatusList({ gates }: { gates: GateStat[] }) {
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Gate Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {gates.length === 0 ? (
          <p className="text-sm text-muted-foreground">No gates configured.</p>
        ) : gates.map((gate) => (
          <div key={gate.id} className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium leading-none">{gate.name}</p>
              <p className="text-xs text-muted-foreground">{gate.location.description}</p>
            </div>
            <Badge
              variant={gate.status === GateStatus.ONLINE ? "default" : "destructive"}
              className={gate.status === GateStatus.ONLINE ? "bg-green-600" : ""}
            >
              {gate.status}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
