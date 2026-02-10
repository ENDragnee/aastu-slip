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
import { createBlock, updateBlock } from "@/lib/api/blocks";
import { fetchLocations } from "@/lib/api/locations"; // ✅ Import location fetcher
import { useToast } from "@/hooks/use-toast";
import { Block, BlockFormData } from "@/types/admin";

interface BlockFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Block | null;
}

export function BlockFormModal({ isOpen, onClose, initialData }: BlockFormModalProps) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<BlockFormData>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // ✅ Fetch locations for the dropdown
  const { data: locations, isLoading: isLoadingLocations } = useQuery({
    queryKey: ["allLocations"],
    queryFn: () => fetchLocations({ page: 1, limit: 100, sort: "description" }),
    enabled: isOpen, // Only fetch when modal is open
  });

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setValue("name", initialData.name);
        setValue("locationId", initialData.locationId || "");
      } else {
        reset({ name: "", locationId: "" });
      }
    }
  }, [isOpen, initialData, reset, setValue]);

  const mutation = useMutation({
    mutationFn: (data: BlockFormData) => {
      if (initialData) {
        return updateBlock(initialData.id, data);
      }
      return createBlock(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBlocks"] });
      toast({
        title: "Success",
        description: `Block ${initialData ? "updated" : "created"} successfully.`
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

  const onSubmit = (data: BlockFormData) => mutation.mutate(data);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Block" : "Add New Block"}</DialogTitle>
          <DialogDescription>
            {initialData ? "Modify the block details below." : "Create a new building block for the campus."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Block Name</Label>
            <Input
              id="name"
              placeholder="e.g. BLOCK 55"
              {...register("name", { required: "Block name is required" })}
            />
            {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="locationId">Location</Label>
            {/* ✅ Select Component for Location */}
            <Select
              onValueChange={(val) => setValue("locationId", val)}
              defaultValue={initialData?.locationId || ""}
            >
              <SelectTrigger disabled={isLoadingLocations}>
                <SelectValue placeholder={isLoadingLocations ? "Loading locations..." : "Select a Location"} />
              </SelectTrigger>
              <SelectContent>
                {locations?.map((loc) => (
                  <SelectItem key={loc.id} value={loc.id}>
                    {loc.description} <span className="text-muted-foreground text-xs">({loc.coordinates})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <input type="hidden" {...register("locationId")} />
            <p className="text-[10px] text-muted-foreground">
              Link this block to physical coordinates (optional).
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {initialData ? "Save Changes" : "Create Block"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
