"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { UserExitInfo } from "@/types";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { UserInformation } from "./student/dashboard/user-information-card";
import { SelectedItems } from "./student/dashboard/selected-items-list";
import { ItemsList } from "./student/dashboard/items-list";
import { ItemOption } from "@/types";
import { SelectedItem } from "@/types";

const fetchItems = async (): Promise<ItemOption[]> => {
  const res = await axios("/api/properties");
  return Array.isArray(res.data.properties) ? res.data.properties : [];
};

export default function StudentExitForm({ userInfo }: { userInfo: UserExitInfo }) {
  const { data, isLoading: itemsIsLoading } = useQuery<ItemOption[]>({
    queryKey: ["items"],
    queryFn: fetchItems,
  });
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="w-full max-w-lg mx-auto p-4 sm:p-0">
      <Card className="shadow-xl border-t-4 border-t-primary bg-card/90 backdrop-blur-sm">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="mx-auto bg-white p-2 rounded-full shadow-sm w-fit mb-4">
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-2 border-secondary">
              <Image src={userInfo.profileUrl} alt="AASTU Logo" fill className="object-cover" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight text-primary">Student Checkout</CardTitle>
          <CardDescription className="text-muted-foreground">
            Complete the form to register your exit items.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Personal Details */}
          <UserInformation userInfo={userInfo} />

          {/* Items Section */}
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

          <div className="space-y-4">
            {itemsIsLoading ? (
              <div className="text-center py-6 text-sm text-muted-foreground border-2 border-dashed rounded-lg">Loading items...</div>
            ) : (
              <ItemsList items={data ?? []} addItem={addItem} />
            )}

            <SelectedItems selectedItems={selectedItems} updateQuantity={updateQuantity} removeItem={
              removeItem
            } />
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {error}
            </motion.div>
          )}

          <Button type="submit" className="w-full font-bold text-lg h-12 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 mb-2">
              <CheckCircle className="h-6 w-6" />
            </div>
            <DialogTitle className="text-center text-xl">Success!</DialogTitle>
            <DialogDescription className="text-center">Your exit slip request has been submitted successfully.</DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center">
            <Button onClick={() => setShowSuccessModal(false)} className="w-full sm:w-auto min-w-30">Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Modal */}
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
            <Button variant="outline" onClick={() => setShowUpdateModal(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
