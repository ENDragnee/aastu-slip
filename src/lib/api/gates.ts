import axios from "axios";
import { Gate, GateFetchParams, GateFormData } from "@/types/admin";

export const fetchGates = async ({
  page,
  limit,
  sort,
  search,
}: GateFetchParams): Promise<Gate[]> => {
  const params: any = { page, limit, sort, order: "desc" };
  if (search) params.search = search;

  const res = await axios.get("/api/gateways", { params });
  return res.data;
};

export const createGate = async (data: GateFormData) => {
  const res = await axios.post("/api/gateways", data);
  return res.data;
};

export const updateGate = async (id: string, data: Partial<GateFormData>) => {
  const res = await axios.patch(`/api/gateways/${id}`, data);
  return res.data;
};

export const deleteGate = async (id: string) => {
  const res = await axios.delete(`/api/gateways/${id}`);
  return res.data;
};
