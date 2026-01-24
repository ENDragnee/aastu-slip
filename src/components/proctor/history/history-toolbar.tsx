"use client";

import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  Calendar as CalendarIcon, Filter, Search, ArrowUpDown
} from "lucide-react";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

interface HistoryToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  // FIX: Use DateRange to handle the optional 'to' property correctly
  date: DateRange | undefined;
  onDateChange: (range: DateRange | undefined) => void;
  sort: string;
  onSortChange: (value: string) => void;
  onClear: () => void;
}

export function HistoryToolbar({
  search,
  onSearchChange,
  date,
  onDateChange,
  sort,
  onSortChange,
  onClear
}: HistoryToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 bg-card p-3 rounded-lg border shadow-sm">
      {/* Search Input */}
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search Student ID..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Date Picker */}
      <div className="flex-1">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal",
                !date?.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, "LLL dd, y")} - {format(date.to, "LLL dd, y")}
                  </>
                ) : (
                  format(date.from, "LLL dd, y")
                )
              ) : (
                <span>Filter by Date</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              // FIX: Removed deprecated 'initialFocus'
              mode="range"
              defaultMonth={date?.from}
              selected={date}
              onSelect={onDateChange}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Sort Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-[180px] justify-between">
            <span className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4" />
              {sort === "createdAt" ? "Date Created" : "Last Updated"}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Sort Order</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={sort} onValueChange={onSortChange}>
            <DropdownMenuRadioItem value="createdAt">Date Created</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="updatedAt">Last Updated</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Clear Filters */}
      {(date?.from || sort !== "createdAt" || search) && (
        <Button variant="ghost" onClick={onClear} className="px-3">
          <Filter className="h-4 w-4 mr-2" /> Clear
        </Button>
      )}
    </div>
  );
}
