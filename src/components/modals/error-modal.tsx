"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export function ErrorModal({
  isOpen,
  onClose,
  title = "An Error Occurred",
  message
}: ErrorModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px] border-l-4 border-l-destructive">
        <DialogHeader className="flex flex-row items-center gap-2">
          <div className="p-2 bg-destructive/10 rounded-full">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div className="space-y-1">
            <DialogTitle className="text-destructive">{title}</DialogTitle>
          </div>
        </DialogHeader>
        <div className="py-4">
          <DialogDescription className="text-base text-foreground">
            {message}
          </DialogDescription>
        </div>
        <DialogFooter>
          <Button onClick={onClose} variant="outline" className="w-full sm:w-auto">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
