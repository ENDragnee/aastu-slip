import axios from "axios";
import { AdminEventRecord, EventFetchParams } from "@/types/events";

export const fetchGlobalEvents = async ({
  page,
  limit,
  sort,
  search,
}: EventFetchParams): Promise<AdminEventRecord[]> => {
  const params: any = { page, limit, sort, order: "desc" };
  if (search) params.search = search;

  const res = await axios.get("/api/histories/events", { params });
  return res.data;
};
