"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker"; // ✅ Import DateRange

import { fetchAdminRequests } from "@/lib/api/admin";
import { PaginationControls } from "@/components/common/pagination-controls";
import { ErrorModal } from "@/components/modals/error-modal";
import { RequestsTable } from "@/components/admin/requests/requests-table";
import { RequestsMobileList } from "@/components/admin/requests/requests-mobile-list";
import { RequestsToolbar } from "@/components/admin/requests/requests-toolbar";
import { RequestDetailModal } from "@/components/student/requests/request-detail-modal";
import { AdminRequestRecord } from "@/types/admin";

export default function AdminRequestsPage() {
  // --- State ---
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [date, setDate] = useState<DateRange | undefined>(undefined);

  const [selectedReq, setSelectedReq] = useState<AdminRequestRecord | null>(null);
  const limit = 10;

  // --- Query ---
  const { data: requests, isLoading, isPlaceholderData, error, refetch } = useQuery({
    queryKey: ["adminRequests", page, search, statusFilter, date?.from, date?.to],
    queryFn: () => fetchAdminRequests({
      page,
      limit,
      sort: "createdAt",
      search,
      status: statusFilter,
      from: date?.from,
      to: date?.to
    }),
    placeholderData: (previousData) => previousData,
  });

  const hasMore = (requests?.length || 0) === limit;
  const isListEmpty = !requests || requests.length === 0;

  // --- Handlers ---
  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const handleDateChange = (range: DateRange | undefined) => {
    setDate(range);
    setPage(1);
  };

  const handleClear = () => {
    setSearch("");
    setStatusFilter("ALL");
    setDate(undefined);
    setPage(1);
  };

  const handleDetailClose = () => setSelectedReq(null);

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8 text-secondary" /> Global Requests
          </h1>
          <p className="text-muted-foreground">Monitor all exit activity across campus.</p>
        </div>
      </div>

      {/* Toolbar */}
      <RequestsToolbar
        search={search}
        onSearchChange={handleSearchChange}
        onRefresh={() => refetch()}
        date={date}
        onDateChange={handleDateChange}
        statusFilter={statusFilter}
        onStatusChange={handleStatusChange}
        onClear={handleClear}
      />

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading records...</p>
        </div>
      ) : (
        <>
          <RequestsMobileList data={requests || []} onViewDetails={setSelectedReq} />
          <RequestsTable data={requests || []} onViewDetails={setSelectedReq} />

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

      {/* Detail Modal */}
      {/* Type casting used if AdminRequestRecord implies slightly different props than StudentRequestItem */}
      <RequestDetailModal
        isOpen={!!selectedReq}
        onClose={handleDetailClose}
        request={selectedReq as any}
      />

      <ErrorModal
        isOpen={!!error}
        onClose={() => { }}
        message={(error as Error)?.message || "Failed to load requests."}
      />
    </div>
  );
}
