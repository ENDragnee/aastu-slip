"use client";

import { Search, ArrowUpDown, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";

interface EventsToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: string;
  onSortChange: (value: string) => void;
  onClear: () => void;
}

export function EventsToolbar({
  search,
  onSearchChange,
  sort,
  onSortChange,
  onClear
}: EventsToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 bg-card p-3 rounded-lg border shadow-sm">
      {/* Search Input */}
      <div className="relative w-full sm:w-72">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by Student ID..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Sort Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-[180px] justify-between">
            <span className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              {sort === "createdAt" ? "Date" : "Status"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Sort By</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={sort} onValueChange={onSortChange}>
            <DropdownMenuRadioItem value="createdAt">Date Occurred</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="status">Action Type</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Filters */}
      {(sort !== "createdAt" || search) && (
        <Button variant="ghost" onClick={onClear} className="px-3">
          <Filter className="h-4 w-4 mr-2" /> Reset
        </Button>
      )}
    </div>
  );
}
