import axios from "axios";
import {
  HistoryRecord,
  HistoryFetchParams,
  EventRecord,
  EventsFetchParams,
} from "@/types/proctor";

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

export const fetchProctorEvents = async ({
  page,
  limit,
  sort,
  search,
}: EventsFetchParams): Promise<EventRecord[]> => {
  const params: any = {
    page,
    limit,
    sort,
    order: "desc",
  };

  if (search) params.search = search;

  const res = await axios.get("/api/histories/proctors/events", { params });
  return res.data;
};
