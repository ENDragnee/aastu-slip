"use client";

import { Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface EventsToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  onRefresh: () => void;
}

export function EventsToolbar({ search, onSearchChange, onRefresh }: EventsToolbarProps) {
  return (
    <div className="flex gap-3 bg-card p-3 rounded-lg border shadow-sm">
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by Student ID..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <Button variant="outline" size="icon" onClick={onRefresh}>
        <RefreshCw className="h-4 w-4" />
      </Button>
    </div>
  );
}
