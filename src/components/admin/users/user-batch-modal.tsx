"use client";

import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Papa from "papaparse";
import {
  UploadCloud, FileSpreadsheet, Loader2, CheckCircle2, AlertCircle, Save, Trash2, Download
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

interface UserBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Define the shape of the User CSV data
interface CsvRow {
  name: string;
  universityId: string;
  email: string;
  role?: string;
  phoneNumber?: string;
  [key: string]: string | undefined;
}

interface ApiResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
}

export function UserBatchModal({ isOpen, onClose }: UserBatchModalProps) {
  const [data, setData] = useState<CsvRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadResult, setUploadResult] = useState<ApiResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // --- Helpers ---
  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,name,universityId,email,role,phoneNumber\nJohn Doe,ETS1234/14,john@example.com,STUDENT,+251911111111\nJane Smith,ETS1235/14,jane@example.com,PROCTOR,";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "user_onboarding_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetState = () => {
    setData([]);
    setUploadResult(null);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  // --- Data Mutation ---
  const updateRow = (index: number, field: keyof CsvRow, value: string) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    setData(newData);
  };

  const removeRow = (index: number) => {
    setData(data.filter((_, i) => i !== index));
  };

  // --- API Mutation ---
  const mutation = useMutation({
    mutationFn: async (rows: CsvRow[]) => {
      // 1. Convert JSON state back to CSV string
      const csvString = Papa.unparse(rows);
      // 2. Create a File object from the string
      const blob = new Blob([csvString], { type: 'text/csv' });
      const file = new File([blob], "users_upload.csv", { type: "text/csv" });

      // 3. Send via FormData to your batch endpoint
      const formData = new FormData();
      formData.append("file", file);

      // Pointing to the batch API we created for users
      const res = await axios.post("/api/users/batch", formData);
      return res.data;
    },
    onSuccess: (data: ApiResponse) => {
      setUploadResult(data);
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });

      if (data.success && data.failed === 0) {
        toast({ title: "Success", description: `Onboarded ${data.processed} users and triggered emails.` });
        setData([]); // Clear preview on full success
      } else {
        toast({
          title: "Partial Success",
          description: `Processed ${data.processed}, Failed ${data.failed}. Check logs below.`,
          variant: "destructive"
        });
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Upload failed. Check server logs.", variant: "destructive" });
    }
  });

  // --- File Parsing ---
  const parseFile = (file: File) => {
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        // Basic validation
        if (!headers.includes("name") || !headers.includes("universityId") || !headers.includes("email")) {
          toast({
            title: "Invalid CSV",
            description: "Missing required columns: name, universityId, email",
            variant: "destructive"
          });
          return;
        }
        setData(results.data);
        setUploadResult(null);
      },
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) parseFile(e.dataTransfer.files[0]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0">

        {/* Header */}
        <DialogHeader className="p-6 pb-2">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle>Bulk User Onboarding</DialogTitle>
              <DialogDescription>
                Upload a CSV to create accounts. Users will receive an email to set their password.
              </DialogDescription>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
              <Download className="h-4 w-4" /> Template
            </Button>
          </div>
        </DialogHeader>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto px-6 py-2">

          {/* State 1: No Data (Upload Zone) */}
          {data.length === 0 && !uploadResult && (
            <div
              className={`
                h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-all mt-4
                ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"}
              `}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                accept=".csv"
                ref={fileInputRef}
                className="hidden"
                onChange={(e) => e.target.files?.[0] && parseFile(e.target.files[0])}
              />
              <div className="bg-muted p-4 rounded-full mb-4">
                <UploadCloud className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Click or drag CSV file here</p>
              <p className="text-xs text-muted-foreground mt-1">Required: name, universityId, email</p>
            </div>
          )}

          {/* State 2: Data Preview (Table) */}
          {data.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground">{data.length} users loaded</h4>
                <Button variant="ghost" size="sm" onClick={() => setData([])} className="text-destructive hover:text-destructive">
                  Clear All
                </Button>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>University ID</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="p-2">
                          <Input
                            value={row.name}
                            onChange={(e) => updateRow(index, "name", e.target.value)}
                            className="h-8 text-xs"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            value={row.universityId}
                            onChange={(e) => updateRow(index, "universityId", e.target.value)}
                            className="h-8 font-mono text-xs"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            value={row.email}
                            onChange={(e) => updateRow(index, "email", e.target.value)}
                            className="h-8 text-xs"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            value={row.role || "STUDENT"}
                            onChange={(e) => updateRow(index, "role", e.target.value.toUpperCase())}
                            className="h-8 text-xs font-mono uppercase"
                            placeholder="STUDENT"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            value={row.phoneNumber || ""}
                            onChange={(e) => updateRow(index, "phoneNumber", e.target.value)}
                            className="h-8 text-xs"
                            placeholder="+251..."
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeRow(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* State 3: Upload Results */}
          {uploadResult && (
            <div className="space-y-4 mt-4">
              <Alert variant={uploadResult.failed === 0 ? "default" : "destructive"}>
                {uploadResult.failed === 0 ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{uploadResult.failed === 0 ? "Import Successful" : "Import Completed with Errors"}</AlertTitle>
                <AlertDescription>
                  Processed & Queued Emails: {uploadResult.processed} | Failed: {uploadResult.failed}
                </AlertDescription>
              </Alert>

              {uploadResult.errors.length > 0 && (
                <ScrollArea className="h-40 w-full rounded-md border p-4 bg-muted/30">
                  <h4 className="text-xs font-bold mb-2 text-destructive">Error Log:</h4>
                  <ul className="space-y-1">
                    {uploadResult.errors.map((err, i) => (
                      <li key={i} className="text-xs text-muted-foreground font-mono border-b pb-1 border-border/50 last:border-0">
                        {err}
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-6 pt-2 border-t bg-muted/10">
          <Button variant="outline" onClick={handleClose}>
            {uploadResult ? "Close" : "Cancel"}
          </Button>

          {/* Show Process button only if data exists and results are not yet shown */}
          {data.length > 0 && !uploadResult && (
            <Button onClick={() => mutation.mutate(data)} disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing & Sending Emails...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Onboard Users
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
