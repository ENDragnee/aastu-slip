"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Plus, Loader2, RefreshCw, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchLocations } from "@/lib/api/locations";
import { PaginationControls } from "@/components/common/pagination-controls";
import { ErrorModal } from "@/components/modals/error-modal";
import { LocationsTable } from "@/components/admin/locations/locations-table";
import { LocationFormModal } from "@/components/admin/locations/location-form-modal";
import { LocationBatchModal } from "@/components/admin/locations/location-batch-modal"; // ✅ Imported
import { Location } from "@/types/admin";

export default function AdminLocationsPage() {
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false); // ✅ Batch state
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const limit = 10;

  const { data: locations, isLoading, isPlaceholderData, error, refetch } = useQuery({
    queryKey: ["adminLocations", page],
    queryFn: () => fetchLocations({ page, limit, sort: "createdAt" }),
    placeholderData: (previousData) => previousData,
  });

  const handleEdit = (loc: Location) => {
    setEditingLocation(loc);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingLocation(null);
    setIsModalOpen(true);
  };

  const hasMore = (locations?.length || 0) === limit;
  const isListEmpty = !locations || locations.length === 0;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight flex items-center gap-2">
            <MapPin className="h-8 w-8 text-secondary" /> Locations
          </h1>
          <p className="text-muted-foreground">Manage physical coordinates for blocks and gates.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" size="icon" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          {/* ✅ Batch Upload Button */}
          <Button variant="outline" onClick={() => setIsBatchModalOpen(true)} className="w-full md:w-auto">
            <UploadCloud className="mr-2 h-4 w-4" /> Bulk Upload
          </Button>
          <Button onClick={handleCreate} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Add Location
          </Button>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading locations...</p>
        </div>
      ) : (
        <>
          <LocationsTable data={locations || []} onEdit={handleEdit} />

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
      <LocationFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingLocation}
      />

      {/* ✅ Batch Modal */}
      <LocationBatchModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
      />

      <ErrorModal
        isOpen={!!error}
        onClose={() => { }}
        message={(error as Error)?.message || "Failed to load locations."}
      />
    </div>
  );
}
