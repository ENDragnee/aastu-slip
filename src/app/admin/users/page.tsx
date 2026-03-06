"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Plus, Loader2, Search, RefreshCw, MoreVertical, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchUsers, deleteUser } from "@/lib/api/users";
import { PaginationControls } from "@/components/common/pagination-controls";
import { ErrorModal } from "@/components/modals/error-modal";
import { UserFormModal } from "@/components/admin/users/user-form-modal";
import { UserBatchModal } from "@/components/admin/users/user-batch-modal";
import { User } from "@/types/admin";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBatchOpen, setIsBatchOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const limit = 10;
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["adminUsers", page, search],
    queryFn: () => fetchUsers({ page, limit, sort: "createdAt", search }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast({ title: "Deleted", description: "User removed." });
    },
    onError: () => toast({ title: "Error", description: "Failed to delete.", variant: "destructive" })
  });

  const users = data?.users || [];
  const hasMore = (users.length) === limit;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight flex items-center gap-2">
            <Users className="h-8 w-8 text-secondary" /> User Management
          </h1>
          <p className="text-muted-foreground">Manage students, proctors, and admins.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsBatchOpen(true)}>
            <UploadCloud className="mr-2 h-4 w-4" /> Bulk Import
          </Button>
          <Button onClick={() => { setEditingUser(null); setIsModalOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 bg-card p-3 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Name, ID or Email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}><RefreshCw className="h-4 w-4" /></Button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center h-64 items-center"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>
      ) : (
        <div className="border rounded-lg bg-card overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{user.universityId}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div>{user.email}</div>
                    <div>{user.phoneNumber}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => { setEditingUser(user); setIsModalOpen(true); }}>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => deleteMutation.mutate(user.id)}>Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      <PaginationControls currentPage={page} hasMore={hasMore} isLoading={isLoading} onPageChange={setPage} />

      {/* Modals */}
      <UserFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={editingUser} />
      <UserBatchModal isOpen={isBatchOpen} onClose={() => setIsBatchOpen(false)} />

      <ErrorModal isOpen={!!error} onClose={() => { }} message={(error as Error)?.message || "Failed to load users."} />
    </div>
  );
}
