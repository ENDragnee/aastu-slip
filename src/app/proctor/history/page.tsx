"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateRange } from "react-day-picker"; // ✅ Import DateRange

// Import Components
import { PaginationControls } from "@/components/common/pagination-controls";
import { ErrorModal } from "@/components/modals/error-modal";
import { HistoryToolbar } from "@/components/proctor/history/history-toolbar";
import { HistoryTable } from "@/components/proctor/history/history-table";
import { HistoryCardList } from "@/components/proctor/history/history-card-list";

// Import Utils & Types
import { fetchProctorHistory } from "@/lib/api/proctor";
import { downloadHistoryCSV } from "@/lib/utils/export-history";

export default function ProctorHistoryPage() {
  // State
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("createdAt");
  const [search, setSearch] = useState("");

  // ✅ FIX: Use DateRange type for compatibility with HistoryToolbar
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const limit = 10;

  // Query
  const {
    data: history,
    isLoading,
    isPlaceholderData,
    error,
    refetch
  } = useQuery({
    // ✅ FIX: Safe access for query key
    queryKey: ["proctorHistory", page, limit, sort, date?.from, date?.to, search],
    queryFn: () => fetchProctorHistory({
      page,
      limit,
      sort,
      from: date?.from, // ✅ FIX: Optional chaining
      to: date?.to,     // ✅ FIX: Optional chaining
      search
    }),
    placeholderData: (previousData) => previousData,
  });

  // Derived State
  const hasMore = (history?.length || 0) === limit;
  const isListEmpty = !history || history.length === 0;

  // Handlers
  const handlePageChange = (newPage: number) => setPage(Math.max(1, newPage));

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  // ✅ FIX: Updated type signature to match HistoryToolbar
  const handleDateChange = (range: DateRange | undefined) => {
    setDate(range);
    setPage(1);
  };

  const clearFilters = () => {
    setDate(undefined); // ✅ FIX: Reset to undefined or clean object
    setSort("createdAt");
    setSearch("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Request History</h1>
          <p className="text-muted-foreground">View past approvals and denials.</p>
        </div>

        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Button
            variant="outline"
            onClick={() => history && downloadHistoryCSV(history)}
            disabled={isListEmpty}
            className="w-full sm:w-auto"
          >
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>

          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <HistoryToolbar
        search={search}
        onSearchChange={handleSearchChange}
        date={date}
        onDateChange={handleDateChange}
        sort={sort}
        onSortChange={setSort}
        onClear={clearFilters}
      />

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading history...</p>
        </div>
      ) : (
        <>
          <HistoryCardList data={history || []} />
          <HistoryTable data={history || []} />

          {!isListEmpty && (
            <PaginationControls
              currentPage={page}
              hasMore={hasMore}
              isLoading={isPlaceholderData}
              onPageChange={handlePageChange}
            />
          )}
        </>
      )}

      {/* Error Modal */}
      <ErrorModal
        isOpen={!!error}
        onClose={() => { }}
        message={(error as Error)?.message || "Failed to load history."}
      />
    </div>
  );
}
