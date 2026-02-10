"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createGate, updateGate } from "@/lib/api/gates";
import { fetchLocations } from "@/lib/api/locations"; // Reuse Location fetcher
import { useToast } from "@/hooks/use-toast";
import { Gate, GateFormData } from "@/types/admin";
import { GateStatus } from "@/generated/prisma/enums";

interface GateFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Gate | null;
}

export function GateFormModal({ isOpen, onClose, initialData }: GateFormModalProps) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<GateFormData>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch Locations for dropdown
  const { data: locations } = useQuery({
    queryKey: ["allLocations"],
    queryFn: () => fetchLocations({ page: 1, limit: 100, sort: "description" }),
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setValue("name", initialData.name);
        setValue("status", initialData.status);
        setValue("locationId", initialData.locationId || "");
      } else {
        reset({ name: "", status: GateStatus.ONLINE, locationId: "" });
      }
    }
  }, [isOpen, initialData, reset, setValue]);

  const mutation = useMutation({
    mutationFn: (data: GateFormData) => {
      if (initialData) {
        return updateGate(initialData.id, data);
      }
      return createGate(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminGates"] });
      toast({
        title: "Success",
        description: `Gate ${initialData ? "updated" : "created"} successfully.`
      });
      onClose();
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.response?.data?.error || "Operation failed.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: GateFormData) => mutation.mutate(data);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Gate" : "Add New Gate"}</DialogTitle>
          <DialogDescription>
            Configure the gate status and location.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Gate Name</Label>
            <Input
              id="name"
              placeholder="e.g. GATE 1"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select
              onValueChange={(val) => setValue("status", val as GateStatus)}
              defaultValue={initialData?.status || GateStatus.ONLINE}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(GateStatus).map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationId">Location</Label>
            <Select
              onValueChange={(val) => setValue("locationId", val)}
              defaultValue={initialData?.locationId || ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent>
                {locations?.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.description} ({loc.coordinates})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" {...register("locationId", { required: true })} />
            {errors.locationId && <span className="text-xs text-red-500">Location selection is required</span>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {initialData ? "Save Changes" : "Create Gate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
