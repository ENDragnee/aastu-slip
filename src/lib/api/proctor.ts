import axios from "axios";
import { HistoryRecord, HistoryFetchParams } from "@/types/proctor";

export const fetchProctorHistory = async ({
  page,
  limit,
  sort,
  from,
  to,
  search,
}: HistoryFetchParams): Promise<HistoryRecord[]> => {
  const params: any = {
    page,
    limit,
    sort,
    order: "desc",
  };

  if (from) params.from = from.toISOString();
  if (to) params.to = to.toISOString();
  if (search) params.search = search;

  const res = await axios.get("/api/histories/proctors", { params });
  return res.data;
};
