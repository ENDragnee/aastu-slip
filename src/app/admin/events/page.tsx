"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Activity, Loader2 } from "lucide-react";
import { fetchGlobalEvents } from "@/lib/api/events";
import { PaginationControls } from "@/components/common/pagination-controls";
import { ErrorModal } from "@/components/modals/error-modal";
import { EventsTable } from "@/components/admin/events/events-table";
import { EventsMobileList } from "@/components/admin/events/events-mobile-list";
import { EventsToolbar } from "@/components/admin/events/events-toolbar";

export default function AdminEventsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 10;

  const { data: events, isLoading, isPlaceholderData, error, refetch } = useQuery({
    queryKey: ["adminEvents", page, search],
    queryFn: () => fetchGlobalEvents({ page, limit, sort: "createdAt", search }),
    placeholderData: (previousData) => previousData,
  });

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const hasMore = (events?.length || 0) === limit;
  const isListEmpty = !events || events.length === 0;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-6">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight flex items-center gap-2">
            <Activity className="h-8 w-8 text-secondary" /> System Activity
          </h1>
          <p className="text-muted-foreground">Audit log of all exit actions performed by staff.</p>
        </div>
      </div>

      <EventsToolbar
        search={search}
        onSearchChange={handleSearchChange}
        onRefresh={() => refetch()}
      />

      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading log data...</p>
        </div>
      ) : (
        <>
          <EventsMobileList data={events || []} />
          <EventsTable data={events || []} />

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

      <ErrorModal
        isOpen={!!error}
        onClose={() => { }}
        message={(error as Error)?.message || "Failed to load events."}
      />
    </div>
  );
}
