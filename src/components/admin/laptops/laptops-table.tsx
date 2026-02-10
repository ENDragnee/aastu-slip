"use client";

import { useState } from "react";
import { format } from "date-fns";
import { MoreHorizontal, Pencil, Trash2, Laptop } from "lucide-react";
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
import { EmptyState } from "@/components/common/empty-state";
import { AdminLaptop } from "@/types/admin";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteLaptop } from "@/lib/api/admin-laptops";
import { useToast } from "@/hooks/use-toast";

interface LaptopsTableProps {
  data: AdminLaptop[];
  onEdit: (laptop: AdminLaptop) => void;
}

export function LaptopsTable({ data, onEdit }: LaptopsTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: deleteLaptop,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminLaptops"] });
      toast({ title: "Deleted", description: "Laptop record removed." });
      setDeleteId(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Could not delete laptop.", variant: "destructive" });
    }
  });

  return (
    <>
      <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Owner</TableHead>
              <TableHead>Device</TableHead>
              <TableHead>Serial Number</TableHead>
              <TableHead>Registered</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-48">
                  <EmptyState title="No laptops found" description="Register a new device or check your search." />
                </TableCell>
              </TableRow>
            ) : data.map((laptop) => (
              <TableRow key={laptop.id} className="hover:bg-muted/30">
                <TableCell>
                  <div className="font-medium">{laptop.user.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">{laptop.user.universityId}</div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Laptop className="h-4 w-4 text-muted-foreground" />
                    <span>{laptop.manufacturer} {laptop.model}</span>
                  </div>
                </TableCell>
                <TableCell className="font-mono text-sm">
                  {laptop.serialNumber}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(laptop.createdAt), "MMM dd, yyyy")}
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
                      <DropdownMenuItem onClick={() => onEdit(laptop)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit Details
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteId(laptop.id)}
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
              This will permanently remove this laptop from the student&apos;s record. They will not be able to exit with it until registered again.
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
