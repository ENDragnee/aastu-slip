"use client";

import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerLaptop } from "@/lib/api/laptops";
import { useToast } from "@/hooks/use-toast";

interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  universityId: string;
  serialNumber: string;
  manufacturer: string;
  model: string;
}

export function LaptopRegistrationModal({ isOpen, onClose }: RegistrationModalProps) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormData>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const mutation = useMutation({
    mutationFn: (data: FormData) => registerLaptop(data.universityId, {
      serialNumber: data.serialNumber,
      manufacturer: data.manufacturer,
      model: data.model
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gatewayLaptops"] });
      toast({ title: "Success", description: "Laptop registered successfully." });
      reset();
      onClose();
    },
    onError: (err: any) => {
      toast({
        title: "Registration Failed",
        description: err.response?.data?.error || "Could not register laptop.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Register New Device</DialogTitle>
          <DialogDescription>Link a laptop to a student using their ID.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="universityId">Student University ID</Label>
            <Input id="universityId" placeholder="e.g. ETS1234/14" {...register("universityId", { required: true })} />
            {errors.universityId && <span className="text-xs text-red-500">Required</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input id="manufacturer" placeholder="Dell, HP..." {...register("manufacturer", { required: true })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input id="model" placeholder="XPS 15..." {...register("model", { required: true })} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="serialNumber">Serial Number</Label>
            <Input id="serialNumber" placeholder="SN123456789" {...register("serialNumber", { required: true })} />
          </div>

          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Register Device
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
