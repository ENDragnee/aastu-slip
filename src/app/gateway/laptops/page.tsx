"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, RefreshCw, Loader2, Laptop2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchLaptops } from "@/lib/api/laptops";
import { PaginationControls } from "@/components/common/pagination-controls";
import { LaptopsTable } from "@/components/gateway/laptops/laptops-table";
import { LaptopsMobileList } from "@/components/gateway/laptops/laptops-mobile-list";
import { LaptopRegistrationModal } from "@/components/gateway/laptops/laptop-registration-modal";
import { ErrorModal } from "@/components/modals/error-modal";

export default function GatewayLaptopsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const limit = 10;

  const { data: laptops, isLoading, isPlaceholderData, error, refetch } = useQuery({
    queryKey: ["gatewayLaptops", page, search],
    queryFn: () => fetchLaptops({ page, limit, sort: "createdAt", search }),
    placeholderData: (previousData) => previousData,
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const hasMore = (laptops?.length || 0) === limit;
  const isListEmpty = !laptops || laptops.length === 0;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight flex items-center gap-2">
            <Laptop2 className="h-8 w-8 text-secondary" /> Laptop Management
          </h1>
          <p className="text-muted-foreground">View registered devices and add new ones.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button className="w-full md:w-auto" onClick={() => setIsModalOpen(true)}>
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
          <p className="text-muted-foreground">Loading devices...</p>
        </div>
      ) : (
        <>
          <LaptopsMobileList data={laptops || []} />
          <LaptopsTable data={laptops || []} />

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

      <LaptopRegistrationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

      <ErrorModal
        isOpen={!!error}
        onClose={() => { }}
        message={(error as Error)?.message || "Failed to load data."}
      />
    </div>
  );
}
