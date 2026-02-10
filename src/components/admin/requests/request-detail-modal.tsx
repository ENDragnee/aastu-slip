"use client";

import { format } from "date-fns";
import { QRCodeSVG } from "qrcode.react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Laptop, Package, Calendar } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { StudentRequestItem } from "@/types/student";
import { ExitStatus } from "@/generated/prisma/enums";

interface RequestDetailModalProps {
  request: StudentRequestItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function RequestDetailModal({ request, isOpen, onClose }: RequestDetailModalProps) {
  if (!request) return null;

  const isApproved = request.currentStatus === ExitStatus.APPROVED;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md md:max-w-lg overflow-hidden">
        <DialogHeader className="text-center sm:text-left">
          <DialogTitle className="text-xl flex flex-col sm:flex-row items-center gap-2 justify-between">
            <span>Exit Request Details</span>
            <StatusBadge status={request.currentStatus} />
          </DialogTitle>
          <DialogDescription>
            ID: <span className="font-mono font-medium text-foreground">{request.exitCode}</span>
          </DialogDescription>
        </DialogHeader>

        {/* QR Code Section - Only show if approved */}
        {isApproved && (
          <div className="flex flex-col items-center justify-center p-6 bg-muted/30 rounded-lg border border-dashed my-2">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <QRCodeSVG value={request.exitCode} size={120} />
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Show this code to the Gateway Operator
            </p>
          </div>
        )}

        <ScrollArea className="max-h-[300px] pr-4">
          <div className="space-y-6">

            {/* Meta Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block text-xs mb-1">Created Date</span>
                <div className="flex items-center gap-1.5 font-medium">
                  <Calendar className="h-3.5 w-3.5" />
                  {format(new Date(request.createdAt), "PPP")}
                </div>
              </div>
              <div className="text-right">
                <span className="text-muted-foreground block text-xs mb-1">Time</span>
                <span className="font-medium">{format(new Date(request.createdAt), "p")}</span>
              </div>
            </div>

            <Separator />

            {/* Laptops Section */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-primary">
                <Laptop className="h-4 w-4" /> Electronics
              </h4>
              {request.laptops && request.laptops.length > 0 ? (
                <ul className="space-y-2">
                  {request.laptops.map((l, idx) => {
                    // ✅ FIX 1: Laptop Safety Check
                    if (!l.laptop) return null;

                    return (
                      <li key={idx} className="text-sm bg-muted/50 p-2.5 rounded-md border">
                        <div className="font-medium">
                          {l.laptop.manufacturer} {l.laptop.model}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono mt-0.5">
                          SN: {l.laptop.serialNumber}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground italic pl-2">No laptops declared.</p>
              )}
            </div>

            {/* Properties Section */}
            <div>
              <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-primary">
                <Package className="h-4 w-4" /> Other Items
              </h4>
              {request.properties && request.properties.length > 0 ? (
                <ul className="space-y-2">
                  {request.properties.map((p, idx) => {
                    // ✅ FIX 2: Property Safety Check
                    // We try to access p.property.name, but fallback to "Unknown" if property is missing
                    const propertyName = p.property?.name || "Unknown Item";

                    return (
                      <li key={idx} className="text-sm flex justify-between items-center bg-muted/50 p-2.5 rounded-md border">
                        <span>{propertyName}</span>
                        <Badge variant="secondary" className="text-xs h-5 px-2">Qty: {p.quantity}</Badge>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground italic pl-2">No other items declared.</p>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
