import { useState, useMemo } from "react";
import { Search, Laptop, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

// Define the Laptop interface based on your Schema
export interface LaptopItem {
  id: string;
  serialNumber: string;
  model: string;
  manufacturer: string;
}

interface LaptopSelectorProps {
  laptops: LaptopItem[];
  selectedLaptopIds: string[];
  onToggleLaptop: (laptopId: string) => void;
  isLoading?: boolean;
}

export function LaptopSelector({
  laptops,
  selectedLaptopIds,
  onToggleLaptop,
  isLoading = false
}: LaptopSelectorProps) {
  const [search, setSearch] = useState("");

  // Filter laptops based on search query (checks model, manufacturer, or serial)
  const filteredLaptops = useMemo(() => {
    if (!search) return laptops;
    const lowerSearch = search.toLowerCase();
    return laptops.filter(
      (laptop) =>
        laptop.model.toLowerCase().includes(lowerSearch) ||
        laptop.manufacturer.toLowerCase().includes(lowerSearch) ||
        laptop.serialNumber.toLowerCase().includes(lowerSearch)
    );
  }, [laptops, search]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Label>Select Laptops</Label>
        <div className="h-32 border border-dashed rounded-md flex flex-col items-center justify-center text-muted-foreground bg-muted/20 animate-pulse">
          <Laptop className="h-8 w-8 mb-2 opacity-50" />
          <span className="text-sm">Loading registered devices...</span>
        </div>
      </div>
    );
  }

  // State: User has no laptops registered at all
  if (laptops.length === 0) {
    return (
      <div className="space-y-3">
        <Label>Select Laptops</Label>
        <div className="border border-muted rounded-md p-6 flex flex-col items-center justify-center text-center bg-muted/30">
          <div className="bg-muted p-3 rounded-full mb-3">
            <Laptop className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">No Laptops Registered</p>
          <p className="text-xs text-muted-foreground mt-1">
            You don't have any laptops registered under your University ID.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Select Laptops to Carry</Label>
        {selectedLaptopIds.length > 0 && (
          <Badge variant="secondary" className="text-xs">
            {selectedLaptopIds.length} Selected
          </Badge>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        {/* text-base prevents iOS zoom on focus, sm:text-sm reverts to compact on desktop */}
        <Input
          placeholder="Search by model or serial..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 text-base sm:text-sm"
        />
      </div>

      {/* List Area */}
      {/* max-h-[220px] is calculated to show approx 3 items (roughly 72px each) */}
      <div className="max-h-[220px] sm:max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
        {filteredLaptops.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8 border rounded-md border-dashed">
            No matching laptops found.
          </div>
        ) : (
          filteredLaptops.map((laptop) => {
            const isSelected = selectedLaptopIds.includes(laptop.id);

            return (
              <button
                key={laptop.id}
                type="button"
                onClick={() => onToggleLaptop(laptop.id)}
                className={cn(
                  "relative w-full text-left p-3 rounded-lg border transition-all duration-200 group touch-manipulation",
                  "flex items-start gap-3 active:scale-[0.98]", // Add touch feedback
                  isSelected
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-border bg-card hover:border-primary/50"
                )}
              >
                {/* Icon Box */}
                <div
                  className={cn(
                    "p-2 rounded-md transition-colors shrink-0", // shrink-0 prevents icon squishing
                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground group-hover:bg-muted/80"
                  )}
                >
                  <Laptop className="h-5 w-5" />
                </div>

                {/* Details */}
                <div className="flex-1 space-y-1 min-w-0"> {/* min-w-0 helps text wrap in flex container */}
                  <div className="flex justify-between items-start gap-2">
                    <span className={cn("font-semibold text-sm truncate", isSelected ? "text-primary" : "text-foreground")}>
                      {laptop.manufacturer} {laptop.model}
                    </span>
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 animate-in zoom-in duration-300" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground font-mono bg-muted/50 inline-block px-1.5 py-0.5 rounded break-all">
                    SN: {laptop.serialNumber}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
