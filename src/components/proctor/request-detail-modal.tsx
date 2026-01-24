"use client";

import { useState } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Laptop, Package, User, Building, Calendar, CheckCircle, XCircle } from "lucide-react";
import { ExitRequestData } from "@/types/proctor";
import { format } from "date-fns";
import { ExitStatus } from "@/generated/prisma/enums";

interface RequestDetailModalProps {
  request: ExitRequestData | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (requestId: string, studentId: string, status: ExitStatus, note: string) => void;
  isProcessing: boolean;
}

export function RequestDetailModal({
  request,
  isOpen,
  onClose,
  onAction,
  isProcessing
}: RequestDetailModalProps) {
  const [note, setNote] = useState("");

  if (!request) return null;

  const dormInfo = request.student.dorms[0]?.dorm;

  const handleAction = (status: ExitStatus) => {
    onAction(request.id, request.student.id, status, note);
    setNote(""); // Reset note
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between pr-4">
            <DialogTitle className="text-2xl font-bold text-primary">Exit Request Details</DialogTitle>
            <Badge variant="outline" className="text-sm px-3 py-1 border-secondary text-secondary-foreground bg-secondary/10">
              {request.currentStatus}
            </Badge>
          </div>
          <DialogDescription>
            Created on {format(new Date(request.createdAt), "PPP p")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Student Info Card */}
          <div className="bg-muted/30 p-4 rounded-lg border space-y-3">
            <h3 className="font-semibold flex items-center gap-2 text-foreground">
              <User className="h-4 w-4 text-primary" /> Student Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block">Name</span>
                <span className="font-medium">{request.student.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">University ID</span>
                <span className="font-medium">{request.student.universityId}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Phone</span>
                <span className="font-medium">{request.student.phoneNumber || "N/A"}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Location</span>
                <span className="font-medium flex items-center gap-1">
                  <Building className="h-3 w-3" />
                  {dormInfo ? `${dormInfo.block.name} - Room ${dormInfo.number}` : "No Dorm Assigned"}
                </span>
              </div>
            </div>
          </div>

          {/* Items & Laptops */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Laptops */}
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                <Laptop className="h-4 w-4 text-primary" /> Laptops ({request.laptops.length})
              </h4>
              {request.laptops.length > 0 ? (
                <ul className="space-y-2">
                  {request.laptops.map((l, idx) => (
                    <li key={idx} className="text-sm bg-muted/50 p-2 rounded">
                      <div className="font-semibold">{l.laptop.manufacturer} {l.laptop.model}</div>
                      <div className="text-xs text-muted-foreground font-mono">SN: {l.laptop.serialNumber}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground italic">No laptops declared.</p>
              )}
            </div>

            {/* Other Items */}
            <div className="border rounded-lg p-4 space-y-3">
              <h4 className="font-medium flex items-center gap-2 text-sm">
                <Package className="h-4 w-4 text-primary" /> Property Items ({request.properties.length})
              </h4>
              {request.properties.length > 0 ? (
                <ul className="space-y-2">
                  {request.properties.map((p, idx) => (
                    <li key={idx} className="text-sm flex justify-between bg-muted/50 p-2 rounded">
                      <span>{p.property.name}</span>
                      <Badge variant="secondary" className="text-xs h-5">x{p.quantity}</Badge>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground italic">No other items declared.</p>
              )}
            </div>
          </div>

          {/* Action Area */}
          <div className="space-y-2">
            <Label htmlFor="note">Add a Note (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Reason for denial or approval notes..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="destructive"
            onClick={() => handleAction(ExitStatus.DENIED)}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            <XCircle className="h-4 w-4 mr-2" />
            Deny
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
            onClick={() => handleAction(ExitStatus.APPROVED)}
            disabled={isProcessing}
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
