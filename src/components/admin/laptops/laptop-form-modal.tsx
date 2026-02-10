"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerLaptop, updateLaptop } from "@/lib/api/admin-laptops";
import { useToast } from "@/hooks/use-toast";
import { AdminLaptop, LaptopFormData } from "@/types/admin";

interface LaptopFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: AdminLaptop | null;
}

export function LaptopFormModal({ isOpen, onClose, initialData }: LaptopFormModalProps) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<LaptopFormData>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setValue("universityId", initialData.user.universityId);
        setValue("serialNumber", initialData.serialNumber);
        setValue("manufacturer", initialData.manufacturer);
        setValue("model", initialData.model);
      } else {
        reset({ universityId: "", serialNumber: "", manufacturer: "", model: "" });
      }
    }
  }, [isOpen, initialData, reset, setValue]);

  const mutation = useMutation({
    mutationFn: (data: LaptopFormData) => {
      if (initialData) {
        // For update, we don't send universityId, just laptop details
        return updateLaptop(initialData.id, {
          serialNumber: data.serialNumber,
          model: data.model,
          manufacturer: data.manufacturer
        });
      }
      return registerLaptop(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminLaptops"] });
      toast({
        title: "Success",
        description: `Laptop ${initialData ? "updated" : "registered"} successfully.`
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

  const onSubmit = (data: LaptopFormData) => mutation.mutate(data);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Laptop" : "Register New Laptop"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Update device details." : "Link a new device to a student."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">

          {/* University ID (ReadOnly if editing) */}
          <div className="space-y-2">
            <Label htmlFor="universityId">Student ID</Label>
            <Input
              id="universityId"
              placeholder="e.g. ETS1234/14"
              {...register("universityId", { required: !initialData })}
              disabled={!!initialData} // Cannot change owner during edit
              className={initialData ? "bg-muted" : ""}
            />
            {errors.universityId && <span className="text-xs text-red-500">Required</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                placeholder="Dell, HP..."
                {...register("manufacturer", { required: "Required" })}
              />
              {errors.manufacturer && <span className="text-xs text-red-500">{errors.manufacturer.message}</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                placeholder="XPS 15..."
                {...register("model", { required: "Required" })}
              />
              {errors.model && <span className="text-xs text-red-500">{errors.model.message}</span>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serialNumber">Serial Number</Label>
            <Input
              id="serialNumber"
              placeholder="SN123456789"
              {...register("serialNumber", { required: "Required" })}
            />
            {errors.serialNumber && <span className="text-xs text-red-500">{errors.serialNumber.message}</span>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {initialData ? "Save Changes" : "Register Device"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
