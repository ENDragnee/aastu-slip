"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Package, Plus, Loader2, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchProperties } from "@/lib/api/properties";
import { ErrorModal } from "@/components/modals/error-modal";
import { PropertiesTable } from "@/components/admin/properties/properties-table";
import { PropertyFormModal } from "@/components/admin/properties/property-form-modal";
import { Property } from "@/types/admin";

export default function AdminPropertiesPage() {
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProp, setEditingProp] = useState<Property | null>(null);

  // Fetch all properties (Client-side filtering since API doesn't support search params yet)
  const { data: properties, isLoading, error, refetch } = useQuery({
    queryKey: ["adminProperties"],
    queryFn: fetchProperties,
  });

  // Client-side search logic
  const filteredProperties = properties?.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleEdit = (prop: Property) => {
    setEditingProp(prop);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingProp(null);
    setIsModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8 text-secondary" /> Property Configuration
          </h1>
          <p className="text-muted-foreground">Manage list of items students can declare.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button onClick={handleCreate} className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Add Property
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex gap-3 bg-card p-3 rounded-lg border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
          <p className="text-muted-foreground">Loading properties...</p>
        </div>
      ) : (
        <PropertiesTable data={filteredProperties} onEdit={handleEdit} />
      )}

      {/* Create/Edit Modal */}
      <PropertyFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingProp}
      />

      <ErrorModal
        isOpen={!!error}
        onClose={() => { }}
        message={(error as Error)?.message || "Failed to load properties."}
      />
    </div>
  );
}
