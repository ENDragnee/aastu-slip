"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createUser, updateUser } from "@/lib/api/users";
import { useToast } from "@/hooks/use-toast";
import { User, UserFormData } from "@/types/admin";
import { Role } from "@/generated/prisma/enums";

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: User | null;
}

export function UserFormModal({ isOpen, onClose, initialData }: UserFormModalProps) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<UserFormData>();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setValue("name", initialData.name);
        setValue("universityId", initialData.universityId);
        setValue("email", initialData.email || "");
        setValue("phoneNumber", initialData.phoneNumber || "");
        setValue("role", initialData.role);
      } else {
        reset({ name: "", universityId: "", email: "", phoneNumber: "", role: Role.STUDENT });
      }
    }
  }, [isOpen, initialData, reset, setValue]);

  const mutation = useMutation({
    mutationFn: (data: UserFormData) => {
      if (initialData) return updateUser(initialData.id, data);
      return createUser(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
      toast({ title: "Success", description: `User ${initialData ? "updated" : "invited"} successfully.` });
      onClose();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.response?.data?.error || "Operation failed.", variant: "destructive" });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit User" : "Add New User"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Full Name</Label>
            <Input {...register("name", { required: "Name is required" })} />
            {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>University ID</Label>
              <Input {...register("universityId", { required: "Required" })} disabled={!!initialData} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Select onValueChange={(val) => setValue("role", val as Role)} defaultValue={initialData?.role || Role.STUDENT}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(Role).map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <Input {...register("email", { required: "Email is required" })} type="email" />
          </div>

          <div className="space-y-2">
            <Label>Phone (Optional)</Label>
            <Input {...register("phoneNumber")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
