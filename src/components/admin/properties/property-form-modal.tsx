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
import { Textarea } from "@/components/ui/textarea";
import { createProperty, updateProperty } from "@/lib/api/properties";
import { useToast } from "@/hooks/use-toast";
import { Property, PropertyFormData } from "@/types/admin";

interface PropertyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Property | null;
}

export function PropertyFormModal({ isOpen, onClose, initialData }: PropertyFormModalProps) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<PropertyFormData>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setValue("name", initialData.name);
        setValue("description", initialData.description);
      } else {
        reset({ name: "", description: "" });
      }
    }
  }, [isOpen, initialData, reset, setValue]);

  const mutation = useMutation({
    mutationFn: (data: PropertyFormData) => {
      if (initialData) {
        return updateProperty(initialData.id, data);
      }
      return createProperty(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminProperties"] });
      toast({
        title: "Success",
        description: `Property ${initialData ? "updated" : "created"} successfully.`
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

  const onSubmit = (data: PropertyFormData) => mutation.mutate(data);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Property" : "Add New Property"}</DialogTitle>
          <DialogDescription>
            Define items that students can declare upon exit (e.g., Mattress, Electronics).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Item Name</Label>
            <Input
              id="name"
              placeholder="e.g. Mattress"
              {...register("name", { required: "Name is required" })}
            />
            {errors.name && <span className="text-xs text-red-500">{errors.name.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="e.g. Standard single bed mattress"
              {...register("description", { required: "Description is required" })}
            />
            {errors.description && <span className="text-xs text-red-500">{errors.description.message}</span>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {initialData ? "Save Changes" : "Create Property"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
