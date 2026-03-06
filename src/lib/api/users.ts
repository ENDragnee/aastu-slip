import axios from "axios";
import { User, UserFetchParams, UserFormData } from "@/types/admin";

export const fetchUsers = async ({
  page,
  limit,
  sort,
  search,
  role,
}: UserFetchParams): Promise<{ users: User[]; total: number }> => {
  const params: any = { page, limit, sort, order: "desc" };
  if (search) params.search = search;
  if (role && role !== "ALL") params.role = role;

  const res = await axios.get("/api/users", { params });
  return res.data;
};

export const createUser = async (data: UserFormData) => {
  const res = await axios.post("/api/users", data);
  return res.data;
};

export const updateUser = async (id: string, data: Partial<UserFormData>) => {
  const res = await axios.patch(`/api/users/${id}`, data);
  return res.data;
};

export const deleteUser = async (id: string) => {
  const res = await axios.delete(`/api/users/${id}`);
  return res.data;
};
