import axios from "axios";
import { Dorm, DormFetchParams, DormFormData } from "@/types/admin";

export const fetchDorms = async ({
  page,
  limit,
  sort,
  search,
}: DormFetchParams): Promise<Dorm[]> => {
  const params: any = { page, limit, sort, order: "desc" };
  if (search) params.search = search;

  const res = await axios.get("/api/dormitories", { params });
  return res.data;
};

export const createDorm = async (data: DormFormData) => {
  const res = await axios.post("/api/dormitories", data);
  return res.data;
};

export const updateDorm = async (id: string, data: Partial<DormFormData>) => {
  const res = await axios.patch(`/api/dormitories/${id}`, data);
  return res.data;
};

export const deleteDorm = async (id: string) => {
  const res = await axios.delete(`/api/dormitories/${id}`);
  return res.data;
};
