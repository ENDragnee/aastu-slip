"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DoorOpen, Plus, Loader2, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchGates } from "@/lib/api/gates";
import { PaginationControls } from "@/components/common/pagination-controls";
import { ErrorModal } from "@/components/modals/error-modal";
import { GatesTable } from "@/components/admin/gateways/gates-table";
import { GateFormModal } from "@/components/admin/gateways/gate-form-modal";
import { Gate } from "@/types/admin";

export default function AdminGatewaysPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGate, setEditingGate] = useState<Gate | null>(null);

  const limit = 10;

  const { data: gates, isLoading, isPlaceholderData, error, refetch } = useQuery({
    queryKey: ["adminGates", page, search],
    queryFn: () => fetchGates({ page, limit, sort: "createdAt", search }),
    placeholderData: (previousData) => previousData,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleEdit = (gate: Gate) => {
    setEditingGate(gate);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingGate(null);
    setIsModalOpen(true);
  };

  const hasMore = (gates?.length || 0) === limit;
  const isListEmpty = !gates || gates.length === 0;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight flex items-center gap-2">
            <DoorOpen className="h-8 w-8 text-secondary" /> Gate Management
          </h1>
          <p className="text-muted-foreground">Monitor and configure campus exit gates.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button onClick={handleCreate} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Add Gate
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 bg-card p-3 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search gates..."
            value={search}
            onChange={handleSearchChange}
            className="pl-8"
          />
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading gates...</p>
        </div>
      ) : (
        <>
          <GatesTable data={gates || []} onEdit={handleEdit} />

          {!isListEmpty && (
            <PaginationControls
              currentPage={page}
              hasMore={hasMore}
              isLoading={isPlaceholderData}
              onPageChange={setPage}
            />
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      <GateFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingGate}
      />

      <ErrorModal
        isOpen={!!error}
        onClose={() => { }}
        message={(error as Error)?.message || "Failed to load gates."}
      />
    </div>
  );
}
