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
import { Block } from "@/types/admin";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBlock } from "@/lib/api/blocks";
import { useToast } from "@/hooks/use-toast";

interface BlocksTableProps {
  data: Block[];
  onEdit: (block: Block) => void;
}

export function BlocksTable({ data, onEdit }: BlocksTableProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: deleteBlock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBlocks"] });
      toast({ title: "Deleted", description: "Block removed successfully." });
      setDeleteId(null);
    },
    onError: (err: any) => {
      toast({ title: "Error", description: "Could not delete block.", variant: "destructive" });
    }
  });

  return (
    <>
      <div className="border rounded-lg bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Block Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-48">
                  <EmptyState title="No blocks found" description="Create a new block to get started." />
                </TableCell>
              </TableRow>
            ) : data.map((block) => (
              <TableRow key={block.id} className="hover:bg-muted/30">
                <TableCell className="font-medium">
                  {block.name}
                </TableCell>
                <TableCell>
                  {block.locationId ? (
                    <Badge variant="outline" className="font-mono text-xs">
                      <MapPin className="mr-1 h-3 w-3" /> {block.locationId.slice(0, 8)}...
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground italic text-xs">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(block.createdAt), "MMM dd, yyyy")}
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
                      <DropdownMenuItem onClick={() => onEdit(block)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleteId(block.id)}
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

      {/* Delete Confirmation Alert */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the block and may affect associated dorms.
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
