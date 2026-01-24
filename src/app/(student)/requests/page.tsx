"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

import { PaginationControls } from "@/components/common/pagination-controls";
import { ErrorModal } from "@/components/modals/error-modal";
import { RequestToolbar } from "@/components/student/requests/request-toolbar";
import { RequestList } from "@/components/student/requests/request-list";
import { RequestDetailModal } from "@/components/student/requests/request-detail-modal";
import { fetchStudentRequests } from "@/lib/api/student";
import { StudentRequestItem } from "@/types/student";

export default function StudentRequestsPage() {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("createdAt");
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<StudentRequestItem | null>(null);

  const limit = 10;

  const {
    data: requests,
    isLoading,
    isPlaceholderData,
    error,
    refetch
  } = useQuery({
    queryKey: ["studentRequests", page, limit, sort, search],
    queryFn: () => fetchStudentRequests({ page, limit, sort, search }),
    placeholderData: (previousData) => previousData,
  });

  const hasMore = (requests?.length || 0) === limit;
  const isListEmpty = !requests || requests.length === 0;

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
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary tracking-tight">My Requests</h1>
          <p className="text-muted-foreground text-sm">Track your exit slip status.</p>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Toolbar */}
      <RequestToolbar
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
          <p className="text-muted-foreground">Loading your requests...</p>
        </div>
      ) : (
        <>
          <RequestList
            data={requests || []}
            onItemClick={(req) => setSelectedRequest(req)}
          />

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

      {/* Detail Modal */}
      <RequestDetailModal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={!!error}
        onClose={() => { }}
        message={(error as Error)?.message || "Failed to load requests."}
      />
    </div>
  );
}
