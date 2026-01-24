import { User, Laptop, Package, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { GatewayExitData } from "@/types/gateway";
import { ExitStatus } from "@/generated/prisma/enums";

interface ExitDetailsCardProps {
  data: GatewayExitData;
  onAction: (status: ExitStatus) => void;
  isProcessing: boolean;
}

export function ExitDetailsCard({ data, onAction, isProcessing }: ExitDetailsCardProps) {
  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg border-t-4 border-t-primary animate-in fade-in slide-in-from-bottom-4 duration-500">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-2">
        <div>
          <CardTitle className="text-2xl font-bold font-mono tracking-wider text-primary">
            #{data.exitCode}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Approved on {format(new Date(data.createdAt), "PPP p")}
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1 text-sm">
          READY FOR EXIT
        </Badge>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Student Info */}
        <div className="bg-muted/30 p-4 rounded-lg border space-y-3">
          <h3 className="font-semibold flex items-center gap-2 text-foreground">
            <User className="h-5 w-5 text-primary" /> Student Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground block text-xs uppercase tracking-wider">Name</span>
              <span className="font-medium text-base">{data.student.name}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-xs uppercase tracking-wider">ID Number</span>
              <span className="font-medium text-base font-mono">{data.student.universityId}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Laptops */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2 border-b pb-2">
              <Laptop className="h-5 w-5 text-secondary" /> Laptops ({data.laptops.length})
            </h4>
            {data.laptops.length > 0 ? (
              <ul className="space-y-3">
                {data.laptops.map((l, idx) => (
                  <li key={idx} className="bg-card border p-3 rounded-md shadow-sm">
                    <div className="font-semibold text-primary">{l.laptop.manufacturer} {l.laptop.model}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-1 bg-muted inline-block px-2 py-0.5 rounded">
                      SN: {l.laptop.serialNumber}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic pl-2">No laptops registered.</p>
            )}
          </div>

          {/* Properties */}
          <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2 border-b pb-2">
              <Package className="h-5 w-5 text-secondary" /> Personal Items ({data.properties.length})
            </h4>
            {data.properties.length > 0 ? (
              <ul className="space-y-2">
                {data.properties.map((p, idx) => (
                  <li key={idx} className="flex justify-between items-center bg-muted/20 p-3 rounded-md border">
                    <span className="font-medium">{p.property.name}</span>
                    <Badge variant="secondary">Qty: {p.quantity}</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground italic pl-2">No other items.</p>
            )}
          </div>
        </div>
      </CardContent>

      <Separator />

      <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6 bg-muted/10">
        <Button
          variant="destructive"
          size="lg"
          className="w-full sm:w-1/3"
          onClick={() => onAction(ExitStatus.DENIED)}
          disabled={isProcessing}
        >
          <XCircle className="mr-2 h-5 w-5" /> Deny Exit
        </Button>
        <Button
          size="lg"
          className="w-full sm:w-2/3 bg-green-600 hover:bg-green-700 text-white"
          onClick={() => onAction(ExitStatus.EXITED)}
          disabled={isProcessing}
        >
          <CheckCircle className="mr-2 h-5 w-5" /> Confirm Exit
        </Button>
      </CardFooter>
    </Card>
  );
}
