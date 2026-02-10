"use client";

import { useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2, MapPin } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/empty-state";
import { Gate } from "@/types/admin";
import { GateStatus } from "@/generated/prisma/enums";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteGate } from "@/lib/api/gates";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface GatesTableProps {
  data: Gate[];
  onEdit: (gate: Gate) => void;
}

export function GatesTable({ data, onEdit }: GatesTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: deleteGate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminGates"] });
      toast({ title: "Deleted", description: "Gate removed successfully." });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Could not delete gate.", variant: "destructive" });
    }
  });

  const getStatusColor = (status: GateStatus) => {
    switch (status) {
      case GateStatus.ONLINE: return "bg-green-100 text-green-800 border-green-200";
      case GateStatus.OFFLINE: return "bg-red-100 text-red-800 border-red-200";
      case GateStatus.BUSY: return "bg-orange-100 text-orange-800 border-orange-200";
      case GateStatus.MAINTENANCE: return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <>
      <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Gate Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48">
                  <EmptyState title="No gates found" description="Add a new gate to start managing exits." />
                </TableCell>
              </TableRow>
            ) : data.map((gate) => (
              <TableRow key={gate.id} className="hover:bg-muted/30">
                <TableCell className="font-medium text-lg">
                  {gate.name}
                </TableCell>
                <TableCell>
                  {gate.location ? (
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{gate.location.description}</span>
                      <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {gate.location.coordinates}
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground italic text-xs">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("font-medium", getStatusColor(gate.status))}>
                    {gate.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(gate.updatedAt), "MMM dd, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => onEdit(gate)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteId(gate.id)}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will delete the gate configuration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
