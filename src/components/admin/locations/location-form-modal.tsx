"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Save, MapPin, LocateFixed } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createLocation, updateLocation } from "@/lib/api/locations";
import { useToast } from "@/hooks/use-toast";
import { Location, LocationFormData } from "@/types/admin";

interface LocationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Location | null;
}

export function LocationFormModal({ isOpen, onClose, initialData }: LocationFormModalProps) {
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<LocationFormData>();
  const [gettingLocation, setGettingLocation] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setValue("coordinates", initialData.coordinates);
        setValue("description", initialData.description);
      } else {
        reset({ coordinates: "", description: "" });
      }
    }
  }, [isOpen, initialData, reset, setValue]);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Error", description: "Geolocation is not supported by your browser.", variant: "destructive" });
      return;
    }

    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = `${position.coords.latitude.toFixed(6)}, ${position.coords.longitude.toFixed(6)}`;
        setValue("coordinates", coords);
        toast({ title: "Location Found", description: "Coordinates autofilled." });
        setGettingLocation(false);
      },
      (error) => {
        toast({ title: "Error", description: "Unable to retrieve location.", variant: "destructive" });
        setGettingLocation(false);
      }
    );
  };

  const mutation = useMutation({
    mutationFn: (data: LocationFormData) => {
      if (initialData) {
        return updateLocation(initialData.id, data);
      }
      return createLocation(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminLocations"] });
      toast({
        title: "Success",
        description: `Location ${initialData ? "updated" : "created"} successfully.`
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

  const onSubmit = (data: LocationFormData) => mutation.mutate(data);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{initialData ? "Edit Location" : "Add New Location"}</DialogTitle>
          <DialogDescription>
            Define coordinates for gates or blocks.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="coordinates">Coordinates</Label>
            <div className="flex gap-2">
              <Input
                id="coordinates"
                placeholder="e.g. 8.9806, 38.7578"
                {...register("coordinates", { required: "Coordinates are required" })}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleGetLocation}
                disabled={gettingLocation}
                title="Use Current Location"
              >
                {gettingLocation ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
              </Button>
            </div>
            {errors.coordinates && <span className="text-xs text-red-500">{errors.coordinates.message}</span>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="e.g. Main Entrance Gate, Block 59 South Side..."
              {...register("description", { required: true })}
            />
            {errors.description && <span className="text-xs text-red-500">Description is required</span>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {initialData ? "Save Changes" : "Create Location"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
