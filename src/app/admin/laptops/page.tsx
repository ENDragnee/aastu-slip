"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Laptop2, Plus, Loader2, Search, RefreshCw, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchAdminLaptops } from "@/lib/api/admin-laptops";
import { PaginationControls } from "@/components/common/pagination-controls";
import { ErrorModal } from "@/components/modals/error-modal";
import { LaptopsTable } from "@/components/admin/laptops/laptops-table";
import { LaptopFormModal } from "@/components/admin/laptops/laptop-form-modal";
import { LaptopBatchModal } from "@/components/admin/laptops/laptop-batch-modal"; // Import new modal
import { AdminLaptop } from "@/types/admin";

export default function AdminLaptopsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");

  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false); // State for batch modal
  const [editingLaptop, setEditingLaptop] = useState<AdminLaptop | null>(null);

  const limit = 10;

  const { data: laptops, isLoading, isPlaceholderData, error, refetch } = useQuery({
    queryKey: ["adminLaptops", page, search],
    queryFn: () => fetchAdminLaptops({ page, limit, sort: "createdAt", search }),
    placeholderData: (previousData) => previousData,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleEdit = (laptop: AdminLaptop) => {
    setEditingLaptop(laptop);
    setIsFormModalOpen(true);
  };

  const handleCreate = () => {
    setEditingLaptop(null);
    setIsFormModalOpen(true);
  };

  const hasMore = (laptops?.length || 0) === limit;
  const isListEmpty = !laptops || laptops.length === 0;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight flex items-center gap-2">
            <Laptop2 className="h-8 w-8 text-secondary" /> Laptop Database
          </h1>
          <p className="text-muted-foreground">Manage student electronic devices.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {/* Batch Upload Button */}
          <Button variant="outline" onClick={() => setIsBatchModalOpen(true)} className="w-full md:w-auto">
            <UploadCloud className="mr-2 h-4 w-4" /> Bulk Upload
          </Button>

          <Button onClick={handleCreate} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Register Laptop
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 bg-card p-3 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by Student ID..."
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
          <p className="text-muted-foreground">Loading laptops...</p>
        </div>
      ) : (
        <>
          <LaptopsTable data={laptops || []} onEdit={handleEdit} />

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

      {/* Single Entry Modal */}
      <LaptopFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        initialData={editingLaptop}
      />

      {/* Batch Upload Modal */}
      <LaptopBatchModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
      />

      <ErrorModal
        isOpen={!!error}
        onClose={() => { }}
        message={(error as Error)?.message || "Failed to load laptop data."}
      />
    </div>
  );
}
