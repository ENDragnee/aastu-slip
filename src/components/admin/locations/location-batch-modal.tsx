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

interface LocationBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CsvRow {
  coordinates: string;
  description: string;
  [key: string]: string;
}

interface ApiResponse {
  success: boolean;
  processed: number;
  failed: number;
  errors: string[];
}

export function LocationBatchModal({ isOpen, onClose }: LocationBatchModalProps) {
  const [data, setData] = useState<CsvRow[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadResult, setUploadResult] = useState<ApiResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,coordinates,description\n9.0177, 38.8431,Main Gate Entrance\n8.9806, 38.7578,Block 55";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "location_template.csv");
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

  const updateRow = (index: number, field: keyof CsvRow, value: string) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    setData(newData);
  };

  const removeRow = (index: number) => {
    setData(data.filter((_, i) => i !== index));
  };

  const mutation = useMutation({
    mutationFn: async (rows: CsvRow[]) => {
      const csvString = Papa.unparse(rows);
      const blob = new Blob([csvString], { type: 'text/csv' });
      const file = new File([blob], "upload.csv", { type: "text/csv" });

      const formData = new FormData();
      formData.append("file", file);

      const res = await axios.post("/api/locations/batch", formData);
      return res.data;
    },
    onSuccess: (data: ApiResponse) => {
      setUploadResult(data);
      queryClient.invalidateQueries({ queryKey: ["adminLocations"] });

      if (data.success && data.failed === 0) {
        toast({ title: "Success", description: `Processed ${data.processed} locations successfully.` });
        setData([]);
      } else {
        toast({
          title: "Partial Success",
          description: `Processed ${data.processed}, Failed ${data.failed}.`,
          variant: "destructive"
        });
      }
    },
    onError: () => {
      toast({ title: "Error", description: "Upload failed.", variant: "destructive" });
    }
  });

  const parseFile = (file: File) => {
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields || [];
        // Basic validation - adjust if columns are optional in your API logic
        if (!headers.includes("description") && !headers.includes("coordinates")) {
          toast({
            title: "Invalid CSV",
            description: "CSV must contain at least 'coordinates' or 'description' columns.",
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
      <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0 gap-0">

        <DialogHeader className="p-6 pb-2">
          <div className="flex justify-between items-start">
            <div>
              <DialogTitle>Bulk Location Registration</DialogTitle>
              <DialogDescription>
                Upload CSV to register multiple locations.
              </DialogDescription>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-2">
              <Download className="h-4 w-4" /> Template
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-2">
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
              <p className="text-xs text-muted-foreground mt-1">Columns: coordinates, description</p>
            </div>
          )}

          {data.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-muted-foreground">{data.length} records loaded</h4>
                <Button variant="ghost" size="sm" onClick={() => setData([])} className="text-destructive hover:text-destructive">
                  Clear All
                </Button>
              </div>

              <div className="border rounded-md">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead>Coordinates</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell className="p-2">
                          <Input
                            value={row.description}
                            onChange={(e) => updateRow(index, "description", e.target.value)}
                            className="h-8 text-xs font-bold"
                            placeholder="Desc..."
                          />
                        </TableCell>
                        <TableCell className="p-2">
                          <Input
                            value={row.coordinates}
                            onChange={(e) => updateRow(index, "coordinates", e.target.value)}
                            className="h-8 text-xs font-mono"
                            placeholder="Lat, Long"
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

          {uploadResult && (
            <div className="space-y-4 mt-4">
              <Alert variant={uploadResult.failed === 0 ? "default" : "destructive"}>
                {uploadResult.failed === 0 ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{uploadResult.failed === 0 ? "Import Successful" : "Import Completed with Errors"}</AlertTitle>
                <AlertDescription>
                  Processed: {uploadResult.processed} | Failed: {uploadResult.failed}
                </AlertDescription>
              </Alert>

              {uploadResult.errors.length > 0 && (
                <ScrollArea className="h-40 w-full rounded-md border p-4 bg-muted/30">
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

        <DialogFooter className="p-6 pt-2 border-t bg-muted/10">
          <Button variant="outline" onClick={handleClose}>
            {uploadResult ? "Close" : "Cancel"}
          </Button>

          {data.length > 0 && (
            <Button onClick={() => mutation.mutate(data)} disabled={mutation.isPending}>
              {mutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" /> Process Batch
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
