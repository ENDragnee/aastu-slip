import axios from "axios";
import { Block, BlockFetchParams, BlockFormData } from "@/types/admin";

export const fetchBlocks = async ({
  page,
  limit,
  sort,
  search,
}: BlockFetchParams): Promise<Block[]> => {
  const params: any = { page, limit, sort, order: "desc" };
  if (search) params.search = search;

  const res = await axios.get("/api/blocks", { params });
  return res.data.fetchBlocks;
};

export const createBlock = async (data: BlockFormData) => {
  const res = await axios.post("/api/blocks", data);
  return res.data;
};

export const updateBlock = async (id: string, data: BlockFormData) => {
  const res = await axios.patch(`/api/blocks/${id}`, data);
  return res.data;
};

export const deleteBlock = async (id: string) => {
  const res = await axios.delete(`/api/blocks/${id}`);
  return res.data;
};
