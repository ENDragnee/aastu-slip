"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, RefreshCw, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import Components
import { PaginationControls } from "@/components/common/pagination-controls";
import { ErrorModal } from "@/components/modals/error-modal";
import { EventsToolbar } from "@/components/proctor/events/events-toolbar";
import { EventsTable } from "@/components/proctor/events/events-table";
import { EventsCardList } from "@/components/proctor/events/events-card-list";

// Import Utils & Types
import { fetchProctorEvents } from "@/lib/api/proctor";

export default function ProctorEventsPage() {
  // State
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("createdAt");
  const [search, setSearch] = useState("");

  const limit = 10;

  // Query
  const {
    data: events,
    isLoading,
    isPlaceholderData,
    error,
    refetch
  } = useQuery({
    queryKey: ["proctorEvents", page, limit, sort, search],
    queryFn: () => fetchProctorEvents({
      page,
      limit,
      sort,
      search
    }),
    placeholderData: (previousData) => previousData,
  });

  // Derived State
  const hasMore = (events?.length || 0) === limit;
  const isListEmpty = !events || events.length === 0;

  // Handlers
  const handlePageChange = (newPage: number) => setPage(Math.max(1, newPage));

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const clearFilters = () => {
    setSort("createdAt");
    setSearch("");
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight flex items-center gap-2">
            <Activity className="h-8 w-8 text-secondary" /> Activity Log
          </h1>
          <p className="text-muted-foreground">Track all actions performed on exit requests.</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <EventsToolbar
        search={search}
        onSearchChange={handleSearchChange}
        sort={sort}
        onSortChange={setSort}
        onClear={clearFilters}
      />

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading activity logs...</p>
        </div>
      ) : (
        <>
          {/* List Components */}
          <EventsCardList data={events || []} />
          <EventsTable data={events || []} />

          {/* Pagination */}
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
        message={(error as Error)?.message || "Failed to load event logs."}
      />
    </div>
  );
}
