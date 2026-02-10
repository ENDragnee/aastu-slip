import axios from "axios";
import { Property, PropertyFormData } from "@/types/admin";

export const fetchProperties = async (): Promise<Property[]> => {
  const res = await axios.get("/api/properties");
  return res.data.properties;
};

export const createProperty = async (data: PropertyFormData) => {
  const res = await axios.post("/api/properties", data);
  return res.data;
};

export const updateProperty = async (
  id: string,
  data: Partial<PropertyFormData>,
) => {
  const res = await axios.patch(`/api/properties/${id}`, data);
  return res.data;
};

export const deleteProperty = async (id: string) => {
  const res = await axios.delete(`/api/properties/${id}`);
  return res.data;
};
