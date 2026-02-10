import axios from "axios";
import { Location, LocationFetchParams, LocationFormData } from "@/types/admin";

export const fetchLocations = async ({
  page,
  limit,
  sort,
}: LocationFetchParams): Promise<Location[]> => {
  const params: any = { page, limit, sort, order: "desc" };
  const res = await axios.get("/api/locations", { params });
  return res.data.fetchLocations;
};

export const createLocation = async (data: LocationFormData) => {
  const res = await axios.post("/api/locations", data);
  return res.data;
};

export const updateLocation = async (id: string, data: LocationFormData) => {
  const res = await axios.patch(`/api/locations/${id}`, data);
  return res.data;
};

export const deleteLocation = async (id: string) => {
  const res = await axios.delete(`/api/locations/${id}`);
  return res.data;
};
