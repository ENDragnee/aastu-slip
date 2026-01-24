import { format } from "date-fns";
import { Laptop } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/common/empty-state";
import { LaptopRecord } from "@/types/laptop";

export function LaptopsMobileList({ data }: { data: LaptopRecord[] }) {
  if (data.length === 0) return <div className="md:hidden border rounded-lg bg-card p-4"><EmptyState /></div>;

  return (
    <div className="grid grid-cols-1 gap-4 md:hidden">
      {data.map((laptop) => (
        <Card key={laptop.id} className="shadow-sm border-l-4 border-l-primary/20">
          <CardHeader className="flex flex-row items-start justify-between pb-2">
            <div className="space-y-1">
              <CardTitle className="text-lg font-medium">{laptop.user.name}</CardTitle>
              <div className="text-sm text-muted-foreground font-mono">{laptop.user.universityId}</div>
            </div>
            <Laptop className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between border-b pb-2">
              <span className="text-muted-foreground">Device:</span>
              <span className="font-medium">{laptop.manufacturer} {laptop.model}</span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-muted-foreground">Serial:</span>
              <span className="font-mono bg-muted px-1 rounded">{laptop.serialNumber}</span>
            </div>
            <div className="text-xs text-muted-foreground text-right pt-2">
              Registered: {format(new Date(laptop.createdAt), "PP")}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
