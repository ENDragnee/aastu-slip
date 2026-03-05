"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building, Plus, Loader2, Search, RefreshCw, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchBlocks } from "@/lib/api/blocks";
import { PaginationControls } from "@/components/common/pagination-controls";
import { ErrorModal } from "@/components/modals/error-modal";
import { BlocksTable } from "@/components/admin/blocks/blocks-table";
import { BlockFormModal } from "@/components/admin/blocks/block-form-modal";
import { BlockBatchModal } from "@/components/admin/blocks/block-batch-modal"; // New
import { Block } from "@/types/admin";

export default function AdminBlocksPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false); // Batch state
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);

  const limit = 10;

  const { data: blocks, isLoading, isPlaceholderData, error, refetch } = useQuery({
    queryKey: ["adminBlocks", page, search],
    queryFn: () => fetchBlocks({ page, limit, sort: "createdAt", search }),
    placeholderData: (previousData) => previousData,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleEdit = (block: Block) => {
    setEditingBlock(block);
    setIsFormModalOpen(true);
  };

  const handleCreate = () => {
    setEditingBlock(null);
    setIsFormModalOpen(true);
  };

  const hasMore = (blocks?.length || 0) === limit;
  const isListEmpty = !blocks || blocks.length === 0;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight flex items-center gap-2">
            <Building className="h-8 w-8 text-secondary" /> Blocks Management
          </h1>
          <p className="text-muted-foreground">Configure campus buildings and infrastructure.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" onClick={() => setIsBatchModalOpen(true)} className="w-full md:w-auto">
            <UploadCloud className="mr-2 h-4 w-4" /> Bulk Upload
          </Button>
          <Button onClick={handleCreate} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Add Block
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 bg-card p-3 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search blocks..."
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
          <p className="text-muted-foreground">Loading blocks...</p>
        </div>
      ) : (
        <>
          <BlocksTable data={blocks || []} onEdit={handleEdit} />

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

      {/* Modals */}
      <BlockFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialData={editingBlock}
      />

      <BlockBatchModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
      />

      <ErrorModal
        isOpen={!!error}
        onClose={() => { }}
        message={(error as Error)?.message || "Failed to load blocks."}
      />
    </div>
  );
}
