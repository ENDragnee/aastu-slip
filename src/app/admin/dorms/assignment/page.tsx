"use client";

import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import Papa from "papaparse";
import {
  UploadCloud, FileSpreadsheet, X, Save, AlertCircle, CheckCircle2, Trash2, Download
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

// --- Types ---

interface CsvRow {
  studentId: string;
  block: string;
  dormNumber: string | number;
  validUntil?: string;
}

interface ApiResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
}

// --- Helper: CSV Template Download ---
const downloadTemplate = () => {
  const csvContent = "data:text/csv;charset=utf-8,studentId,block,dormNumber,validUntil\nETS1234/14,BLOCK A,101,2026-12-31";
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "dorm_assignment_template.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function DormAssignmentPage() {
  const [data, setData] = useState<CsvRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadResult, setUploadResult] = useState<ApiResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // --- 1. Upload Mutation ---
  const mutation = useMutation({
    mutationFn: async (rows: CsvRow[]) => {
      // Convert JSON state back to CSV for the API (since API expects a file)
      const csvString = Papa.unparse(rows);
      const blob = new Blob([csvString], { type: 'text/csv' });
      const file = new File([blob], "upload.csv", { type: "text/csv" });

      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("/api/dormitories/students/update", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: (res: ApiResponse) => {
      setUploadResult(res);
      if (res.failed === 0) {
        toast({ title: "Batch Complete", description: `Successfully processed ${res.processed} records.` });
        setData([]); // Clear data on total success
      } else {
        toast({
          title: "Partial Success",
          description: `Processed ${res.processed}, Failed ${res.failed}. Check logs below.`,
          variant: "destructive"
        });
      }
    },
    onError: (err) => {
      toast({ title: "Upload Failed", description: "Server error occurred.", variant: "destructive" });
    }
  });

  // --- 2. File Handling ---
  const parseFile = (file: File) => {
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Basic validation of headers
        const headers = results.meta.fields || [];
        if (!headers.includes("studentId") || !headers.includes("block") || !headers.includes("dormNumber")) {
          toast({
            title: "Invalid Format",
            description: "CSV missing required columns: studentId, block, dormNumber",
            variant: "destructive"
          });
          return;
        }
        setData(results.data);
        setUploadResult(null); // Reset previous results
      },
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) {
      parseFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      parseFile(e.target.files[0]);
    }
  };

  // --- 3. Editing Logic ---
  const updateRow = (index: number, field: keyof CsvRow, value: string) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    setData(newData);
  };

  const removeRow = (index: number) => {
    setData(data.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary tracking-tight flex items-center gap-2">
            <UploadCloud className="h-8 w-8 text-secondary" /> Bulk Assignment
          </h1>
          <p className="text-muted-foreground">Upload a CSV file to assign multiple students to dormitories at once.</p>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <FileSpreadsheet className="mr-2 h-4 w-4" /> Download Template
        </Button>
      </div>

      {/* --- Main Content Grid --- */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Left Column: Upload Area */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>Upload File</CardTitle>
            <CardDescription>Drag and drop your .csv file here.</CardDescription>
          </CardHeader>
          <CardContent>
            <div
              className={`
                border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
                ${isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"}
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
                onChange={handleFileSelect}
              />
              <div className="flex flex-col items-center gap-2">
                <UploadCloud className={`h-10 w-10 ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-sm font-medium">Click or drag file to upload</p>
                <p className="text-xs text-muted-foreground">CSV files only</p>
              </div>
            </div>

            {/* Results Summary */}
            {uploadResult && (
              <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-top-2">
                <Alert variant={uploadResult.failed === 0 ? "default" : "destructive"}>
                  {uploadResult.failed === 0 ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                  <AlertTitle>{uploadResult.failed === 0 ? "Success" : "Completed with Errors"}</AlertTitle>
                  <AlertDescription>
                    Processed: {uploadResult.processed} | Failed: {uploadResult.failed}
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
          </CardContent>
        </Card>

        {/* Right Column: Preview & Edit */}
        <Card className="lg:col-span-2 flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Data Preview</CardTitle>
              <CardDescription>
                Review and edit data before processing. {data.length > 0 && <span>({data.length} records)</span>}
              </CardDescription>
            </div>
            {data.length > 0 && (
              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setData([])} disabled={mutation.isPending}>
                  Clear
                </Button>
                <Button onClick={() => mutation.mutate(data)} disabled={mutation.isPending}>
                  {mutation.isPending ? "Processing..." : "Process Batch"}
                  <Save className="ml-2 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardHeader>

          <CardContent className="flex-1 min-h-[400px] p-0 relative">
            {data.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground bg-muted/10">
                <div className="text-center">
                  <FileSpreadsheet className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No data loaded yet.</p>
                </div>
              </div>
            ) : (
              <div className="border-t">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Student ID</TableHead>
                      <TableHead>Block</TableHead>
                      <TableHead>Dorm #</TableHead>
                      <TableHead>Valid Until</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="p-2">
                          <Input
                            value={row.studentId}
                            onChange={(e) => updateRow(index, "studentId", e.target.value)}
                            className="h-8 font-mono text-xs"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            value={row.block}
                            onChange={(e) => updateRow(index, "block", e.target.value)}
                            className="h-8 text-xs"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            value={row.dormNumber}
                            onChange={(e) => updateRow(index, "dormNumber", e.target.value)}
                            className="h-8 text-xs w-20"
                            type="number"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            value={row.validUntil || ""}
                            onChange={(e) => updateRow(index, "validUntil", e.target.value)}
                            className="h-8 text-xs w-32"
                            type="date"
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => removeRow(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
