"use client";

import { useEffect, useState } from "react";
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
import { createDorm, updateDorm } from "@/lib/api/dorms";
import { fetchBlocks } from "@/lib/api/blocks"; // Reuse existing block fetcher
import { useToast } from "@/hooks/use-toast";
import { Dorm, DormFormData } from "@/types/admin";
import { DormStatus } from "@/generated/prisma/enums";

interface DormFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Dorm | null;
}

export function DormFormModal({ isOpen, onClose, initialData }: DormFormModalProps) {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<DormFormData>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch blocks for the dropdown
  const { data: blocks } = useQuery({
    queryKey: ["allBlocks"],
    queryFn: () => fetchBlocks({ page: 1, limit: 100, sort: "name" }), // Fetch top 100 blocks for selection
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setValue("number", initialData.number);
        setValue("status", initialData.status);
        setValue("blockId", initialData.blockId);
      } else {
        reset({ number: undefined, status: DormStatus.FREE, blockId: "" });
      }
    }
  }, [isOpen, initialData, reset, setValue]);

  const mutation = useMutation({
    mutationFn: (data: DormFormData) => {
      // Ensure number is sent as number
      const payload = { ...data, number: Number(data.number) };
      if (initialData) {
        return updateDorm(initialData.id, payload);
      }
      return createDorm(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDorms"] });
      toast({
        title: "Success",
        description: `Dormitory ${initialData ? "updated" : "created"} successfully.`
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

  const onSubmit = (data: DormFormData) => mutation.mutate(data);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Dormitory" : "Add New Dormitory"}</DialogTitle>
          <DialogDescription>
            Configure the room details and assign it to a block.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">Room Number</Label>
              <Input
                id="number"
                type="number"
                placeholder="101"
                {...register("number", { required: "Room number is required", min: 1 })}
              />
              {errors.number && <span className="text-xs text-red-500">{errors.number.message}</span>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                onValueChange={(val) => setValue("status", val as DormStatus)}
                defaultValue={initialData?.status || DormStatus.FREE}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(DormStatus).map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="blockId">Building Block</Label>
            <Select
              onValueChange={(val) => setValue("blockId", val)}
              defaultValue={initialData?.blockId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a Block" />
              </SelectTrigger>
              <SelectContent>
                {blocks?.map((block) => (
                  <SelectItem key={block.id} value={block.id}>
                    {block.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" {...register("blockId", { required: true })} />
            {errors.blockId && <span className="text-xs text-red-500">Block selection is required</span>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {initialData ? "Save Changes" : "Create Dorm"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
