"use client";

import { format } from "date-fns";
import { DateRange } from "react-day-picker";
import {
  Search, Filter, RefreshCw, Calendar as CalendarIcon, ListFilter
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
import { ExitStatus } from "@/generated/prisma/enums";

interface RequestsToolbarProps {
  search: string;
  onSearchChange: (val: string) => void;
  onRefresh: () => void;
  // New Props
  date: DateRange | undefined;
  onDateChange: (range: DateRange | undefined) => void;
  statusFilter: string;
  onStatusChange: (val: string) => void;
  onClear: () => void;
}

export function RequestsToolbar({
  search,
  onSearchChange,
  onRefresh,
  date,
  onDateChange,
  statusFilter,
  onStatusChange,
  onClear
}: RequestsToolbarProps) {

  const hasActiveFilters = search || (date?.from) || statusFilter !== "ALL";

  return (
    <div className="flex flex-col md:flex-row gap-3 bg-card p-3 rounded-lg border shadow-sm">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by Student ID..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>

      {/* Date Picker */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={cn(
              "justify-start text-left font-normal md:w-[240px]",
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
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>

      {/* Status Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="justify-between gap-2 md:w-[160px]">
            <span className="flex items-center gap-2">
              <ListFilter className="h-4 w-4" />
              {statusFilter === "ALL" ? "All Status" : statusFilter}
            </span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Filter Status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={statusFilter} onValueChange={onStatusChange}>
            <DropdownMenuRadioItem value="ALL">All Status</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value={ExitStatus.REQUESTED}>Requested</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value={ExitStatus.APPROVED}>Approved</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value={ExitStatus.DENIED}>Denied</DropdownMenuRadioItem>
            <DropdownMenuRadioItem value={ExitStatus.EXITED}>Exited</DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Actions */}
      <div className="flex gap-2">
        {hasActiveFilters && (
          <Button variant="ghost" size="icon" onClick={onClear} title="Clear Filters">
            <Filter className="h-4 w-4" />
          </Button>
        )}
        <Button variant="outline" size="icon" onClick={onRefresh} title="Refresh Data">
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
