"use client";

import { useState } from "react";
import Image from "next/image"; // ✅ Import Image
import { useMutation } from "@tanstack/react-query";
import { fetchExitByCode, updateExitStatus } from "@/lib/api/gateway";
import { GatewayExitData } from "@/types/gateway";
import { ExitStatus } from "@/generated/prisma/enums";
import { SearchSection } from "@/components/gateway/search-section";
import { ExitDetailsCard } from "@/components/gateway/exit-details-card";
import { ErrorModal } from "@/components/modals/error-modal";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

export default function GatewayPage() {
  const [exitData, setExitData] = useState<GatewayExitData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { toast } = useToast();

  // 1. Search Mutation
  const searchMutation = useMutation({
    mutationFn: fetchExitByCode,
    onSuccess: (data) => {
      setExitData(data);
      setErrorMsg(null);
    },
    onError: (err: any) => {
      setExitData(null);
      const msg = err.response?.data?.message || err.response?.data?.error || "Failed to verify code.";
      setErrorMsg(msg);
    },
  });

  // 2. Action Mutation (Exit/Deny)
  const actionMutation = useMutation({
    mutationFn: ({ status, note }: { status: ExitStatus; note: string }) => {
      if (!exitData) throw new Error("No active exit data");
      return updateExitStatus(exitData.exitCode, status, note);
    },
    onSuccess: (_, variables) => {
      const isExit = variables.status === ExitStatus.EXITED;

      if (toast) {
        toast({
          title: isExit ? "Exit Confirmed" : "Exit Denied",
          description: `Student ${exitData?.student.name} processed successfully.`,
          variant: isExit ? "default" : "destructive",
        });
      }

      setExitData(null);
    },
    onError: (err: any) => {
      setErrorMsg(err.response?.data?.error || "Failed to process action.");
    },
  });

  const handleSearch = (code: string) => {
    searchMutation.mutate(code);
  };

  const handleAction = (status: ExitStatus) => {
    actionMutation.mutate({ status, note: status === ExitStatus.DENIED ? "Denied at Gate" : "Exited Successfully" });
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center">

      {!exitData ? (
        <div className="flex-1 flex flex-col justify-center items-center w-full max-w-2xl animate-in fade-in zoom-in duration-300 space-y-8">

          {/* ✅ LOGO SECTION */}
          <div className="relative group">
            {/* Glow Effect (Squared) */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

            {/* Image Container (Squared/Cuboid) */}
            <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden border-4 border-background shadow-xl bg-white">
              <Image
                src="/AASTU.jpg"
                alt="AASTU Logo"
                fill
                className="object-contain p-2" // ✅ Fits image inside + padding
                priority
              />
            </div>
          </div>

          <SearchSection
            onSearch={handleSearch}
            isLoading={searchMutation.isPending}
          />
        </div>
      ) : (
        <div className="w-full space-y-6">
          <div className="flex justify-between items-center max-w-3xl mx-auto">
            <Button variant="ghost" onClick={() => setExitData(null)}>
              &larr; Verify Another Code
            </Button>
          </div>

          <ExitDetailsCard
            data={exitData}
            onAction={handleAction}
            isProcessing={actionMutation.isPending}
          />
        </div>
      )}

      <ErrorModal
        isOpen={!!errorMsg}
        onClose={() => setErrorMsg(null)}
        title="Verification Failed"
        message={errorMsg || "An unexpected error occurred."}
      />
    </div>
  );
}
