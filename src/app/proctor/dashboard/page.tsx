"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Search, MoreVertical, Eye, Check, X, Loader2, RefreshCw,
  ArrowUpDown
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ErrorModal } from "@/components/modals/error-modal";
import { RequestDetailModal } from "@/components/proctor/request-detail-modal";
import { PaginationControls } from "@/components/common/pagination-controls"; // Imported Component
import { ExitRequestData } from "@/types/proctor";
import { ExitStatus } from "@/generated/prisma/enums";

// --- API Functions ---

const fetchRequests = async (page: number, limit: number, sort: string): Promise<ExitRequestData[]> => {
  const res = await axios.get("/api/requests/proctors", {
    params: { page, limit, sort, order: "desc" }
  });
  return res.data;
};

const searchRequests = async (id: string, page: number, limit: number): Promise<ExitRequestData[]> => {
  const res = await axios.get(`/api/requests/proctors/search/${id}`, {
    params: { page, limit }
  });
  return res.data;
};

const updateStatus = async (payload: { requestId: string; studentId: string; exitStatus: ExitStatus; note: string }) => {
  // PATCH route expects studentId in URL and other data in body
  const res = await axios.patch(`/api/requests/proctors/users/${payload.studentId}`, {
    requestId: payload.requestId,
    exitStatus: payload.exitStatus,
    note: payload.note
  });
  return res.data;
};

// --- Page Component ---

export default function ProctorDashboard() {
  // State
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState("createdAt"); // 'createdAt' or 'updatedAt'
  const limit = 10;

  const [selectedRequest, setSelectedRequest] = useState<ExitRequestData | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // 1. Data Query 
  const { data: requests, isLoading, isPlaceholderData, error } = useQuery({
    queryKey: ["proctorRequests", search, page, limit, sort],
    queryFn: () =>
      search.length > 2
        ? searchRequests(search, page, limit)
        : fetchRequests(page, limit, sort),
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
  });

  // 2. Mutation
  const actionMutation = useMutation({
    mutationFn: updateStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["proctorRequests"] });
      setIsDetailOpen(false);
      setSelectedRequest(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || "Failed to update request status.");
    },
  });

  // Handlers
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset to page 1 on new search
  };

  const handlePageChange = (newPage: number) => {
    setPage(Math.max(1, newPage));
  };

  const openDetails = (req: ExitRequestData) => {
    setSelectedRequest(req);
    setIsDetailOpen(true);
  };

  const handleAction = (requestId: string, studentId: string, status: ExitStatus, note: string) => {
    actionMutation.mutate({ requestId, studentId, exitStatus: status, note });
  };

  const handleQuickAction = (req: ExitRequestData, status: ExitStatus) => {
    actionMutation.mutate({ requestId: req.id, studentId: req.student.id, exitStatus: status, note: "" });
  };

  // Derived state for pagination checks
  const hasMore = (requests?.length || 0) === limit;
  const isListEmpty = !requests || requests.length === 0;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight">Proctor Dashboard</h1>
          <p className="text-muted-foreground">Manage and review student exit requests.</p>
        </div>

        <div className="flex flex-col sm:flex-row w-full md:w-auto gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ID (e.g. ETS1234)"
              value={search}
              onChange={handleSearchChange}
              className="pl-8 bg-card"
            />
          </div>

          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <ArrowUpDown className="h-4 w-4" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuRadioGroup value={sort} onValueChange={setSort}>
                  <DropdownMenuRadioItem value="createdAt">Date Created</DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="updatedAt">Last Updated</DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="outline" size="icon" onClick={() => queryClient.invalidateQueries({ queryKey: ["proctorRequests"] })}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading requests...</p>
        </div>
      ) : (
        <>
          {/* Mobile View (Cards) */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {isListEmpty ? (
              <div className="text-center p-8 border rounded-lg bg-card text-muted-foreground">No pending requests found.</div>
            ) : requests?.map((req) => (
              <Card key={req.id} className="shadow-sm border-l-4 border-l-secondary">
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{req.student.name}</CardTitle>
                    <div className="text-sm text-muted-foreground font-mono">{req.student.universityId}</div>
                  </div>
                  <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                    {req.currentStatus}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2">
                      <Package size={16} className="text-muted-foreground" />
                      <span>{req.properties.length} Items</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Laptop size={16} className="text-muted-foreground" />
                      <span>{req.laptops.length} Laptops</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" className="flex-1" onClick={() => openDetails(req)}>
                      Details
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleQuickAction(req, ExitStatus.APPROVED)}>
                          <Check className="mr-2 h-4 w-4 text-green-600" /> Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleQuickAction(req, ExitStatus.DENIED)}>
                          <X className="mr-2 h-4 w-4 text-red-600" /> Deny
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden md:block border rounded-lg bg-card shadow-sm overflow-hidden">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Dormitory</TableHead>
                  <TableHead>Declared</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isListEmpty ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                      No pending requests found for your block.
                    </TableCell>
                  </TableRow>
                ) : requests?.map((req) => (
                  <TableRow key={req.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="font-medium">{req.student.name}</div>
                      <div className="text-xs text-muted-foreground">{req.student.universityId}</div>
                    </TableCell>
                    <TableCell>
                      {req.student.dorms[0] ? (
                        <Badge variant="secondary" className="font-normal">
                          {req.student.dorms[0].dorm.block.name} - {req.student.dorms[0].dorm.number}
                        </Badge>
                      ) : <span className="text-muted-foreground italic">Unassigned</span>}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm space-y-1">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Laptop className="h-3 w-3" /> {req.laptops.length} Laptops
                        </div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Package className="h-3 w-3" /> {req.properties.length} Items
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        {req.currentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => openDetails(req)}>
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleQuickAction(req, ExitStatus.APPROVED)}>
                            <Check className="mr-2 h-4 w-4 text-green-600" /> Approve
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleQuickAction(req, ExitStatus.DENIED)}>
                            <X className="mr-2 h-4 w-4 text-red-600" /> Deny
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination Controls - Reusable Component */}
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

      {/* Modals */}
      <RequestDetailModal
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        request={selectedRequest}
        onAction={handleAction}
        isProcessing={actionMutation.isPending}
      />

      <ErrorModal
        isOpen={!!error || !!errorMsg}
        onClose={() => setErrorMsg(null)}
        message={errorMsg || (error as Error)?.message || "An unknown error occurred."}
      />
    </div>
  );
}

// Simple Helper Components for Icons in the File
function Package({ className, size }: { className?: string, size?: number }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22v-9" /></svg>
}

function Laptop({ className, size }: { className?: string, size?: number }) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" /></svg>
}
