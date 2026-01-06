"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Minus, Plus, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// --- Types ---
interface Item {
  name: string;
  quantity: number;
}

interface FormData {
  name: string;
  studentId: string;
  dorm: string;
  block: string;
}

const ITEMS_LIST = [
  "Clothes (ልብስ)",
  "Shoes (ጫማ)",
  "Bedding (የአልጋ ልብስ)",
  "Books (መፀሀፍ)",
  "Hygiene Products (የግል ንፅህና መጠበቂያ)",
  "Electronics (ኤሌክትሮኒክስ)",
];

// --- Mock Data Service ---
const mockSubmitData = async (data: any, isUpdate = false) => {
  return new Promise<{ ok: boolean; error?: string; status?: string }>((resolve) => {
    setTimeout(() => {
      // Mock validation: Fail if ID is "ETS0000/00"
      if (data.studentId === "ETS0000/00" && !isUpdate) {
        resolve({ ok: false, error: "Student not found or already exited.", status: "NOT_EXITED" });
      } else {
        resolve({ ok: true });
      }
    }, 1500);
  });
};

export default function StudentExitForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    studentId: "",
    dorm: "",
    block: "",
  });
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<any>(null);

  // --- Helpers ---
  const validateStudentId = (studentId: string) => {
    const etsPattern = /^ETS\d{4}\/\d{2}$/i;
    const numberPattern = /^\d{4}\/\d{2}$/;

    if (etsPattern.test(studentId)) {
      return studentId.toUpperCase();
    } else if (numberPattern.test(studentId)) {
      return `ETS${studentId.toUpperCase()}`;
    }
    return null;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    if (error) setError(""); // Clear error on type
  };

  const addItem = (itemName: string) => {
    if (selectedItems.some((i) => i.name === itemName)) {
      setError("Item already added.");
      return;
    }
    setSelectedItems((prev) => [...prev, { name: itemName, quantity: 1 }]);
    setError("");
  };

  const updateQuantity = (index: number, delta: number) => {
    setSelectedItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
      )
    );
  };

  const removeItem = (index: number) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setFormData({ name: "", studentId: "", dorm: "", block: "" });
    setSelectedItems([]);
    setPendingSubmission(null);
  };

  // --- Submission Handlers ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.studentId || !formData.dorm || !formData.block || selectedItems.length === 0) {
      setError("Please fill in all fields and add at least one item.");
      return;
    }

    const validId = validateStudentId(formData.studentId);
    if (!validId) {
      setError("Invalid ID format. Use ETSxxxx/xx");
      return;
    }

    setIsLoading(true);

    // Replace API Fetch with Mock
    const submission = { ...formData, studentId: validId, items: selectedItems };

    try {
      const result = await mockSubmitData(submission);

      if (result.ok) {
        setShowSuccessModal(true);
        resetForm();
      } else if (result.status === "NOT_EXITED") {
        setPendingSubmission(submission);
        setShowUpdateModal(true);
      } else {
        setError(result.error || "Submission failed.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateConfirm = async () => {
    setShowUpdateModal(false);
    setIsLoading(true);

    // Mock Update Call
    try {
      await new Promise((r) => setTimeout(r, 1000)); // Simulate delay
      setShowSuccessModal(true);
      resetForm();
    } catch (err) {
      setError("Update failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto p-4 sm:p-0">
      <Card className="shadow-xl border-t-4 border-t-primary bg-card/90 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="mx-auto bg-white p-2 rounded-full shadow-sm w-fit mb-4">
            {/* Ensure you have this image in public/AASTU.jpg */}
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-secondary">
              <Image
                src="/AASTU.jpg"
                alt="AASTU Logo"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">
            Student Checkout
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Complete the form to register your exit items.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Details Section */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Abebe Kebede"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input
                    id="studentId"
                    placeholder="ETSxxxx/xx"
                    value={formData.studentId}
                    onChange={handleInputChange}
                    className="bg-background"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="block">Block No.</Label>
                  <Input
                    id="block"
                    placeholder="B-44"
                    value={formData.block}
                    onChange={handleInputChange}
                    className="bg-background"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dorm">Dorm No.</Label>
                  <Input
                    id="dorm"
                    placeholder="101"
                    value={formData.dorm}
                    onChange={handleInputChange}
                    className="bg-background"
                  />
                </div>
              </div>
            </div>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-semibold tracking-wider">
                  Items Declaration
                </span>
              </div>
            </div>

            {/* Items Section */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Items to Carry</Label>
                <Select onValueChange={addItem}>
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select an item..." />
                  </SelectTrigger>
                  <SelectContent>
                    {ITEMS_LIST.map((item) => (
                      <SelectItem key={item} value={item} className="cursor-pointer">
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Selected Items List */}
              <div className="space-y-3 mt-4">
                <AnimatePresence>
                  {selectedItems.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
                    >
                      <span className="text-sm font-medium text-foreground">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center bg-background rounded-md border shadow-sm">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-r-none hover:text-destructive"
                            onClick={() => updateQuantity(index, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-xs font-mono">
                            {item.quantity}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-l-none hover:text-primary"
                            onClick={() => updateQuantity(index, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                          onClick={() => removeItem(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {selectedItems.length === 0 && (
                  <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                    No items added yet.
                  </div>
                )}
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md"
              >
                <AlertCircle className="h-4 w-4" />
                {error}
              </motion.div>
            )}

            <Button
              type="submit"
              className="w-full font-bold text-lg h-12 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* --- Modals --- */}

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
              <CheckCircle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-xl">Success!</DialogTitle>
            <DialogDescription className="text-center">
              Your exit slip request has been submitted successfully.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button
              onClick={() => setShowSuccessModal(false)}
              className="w-full sm:w-auto min-w-[120px]"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Confirmation Modal */}
      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-secondary-foreground">
              <AlertCircle className="h-5 w-5 text-secondary" />
              Existing Request Found
            </DialogTitle>
            <DialogDescription className="pt-2">
              A request with Student ID <strong>{pendingSubmission?.studentId}</strong> already exists but hasn't been closed.
              Would you like to update it with these new items?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowUpdateModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              onClick={handleUpdateConfirm}
            >
              Update Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
