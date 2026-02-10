import axios from "axios";
import {
  GateStat,
  BlockStat,
  ExitRequestStat,
  AdminRequestRecord,
  AdminRequestParams,
} from "@/types/admin";

export const fetchGateStats = async (): Promise<GateStat[]> => {
  // Assuming this endpoint returns the list of gates
  const res = await axios.get("/api/gateways");
  return res.data;
};

export const fetchBlockStats = async (): Promise<BlockStat[]> => {
  const res = await axios.get("/api/dormitories/students");
  return res.data;
};

export const fetchRecentExits = async (): Promise<ExitRequestStat[]> => {
  const res = await axios.get(
    "/api/requests?limit=5&sort=createdAt&order=desc",
  );
  return res.data;
};

export const fetchAdminRequests = async ({
  page,
  limit,
  sort,
  search,
  status,
  from,
  to,
}: AdminRequestParams): Promise<AdminRequestRecord[]> => {
  const params: any = {
    page,
    limit,
    sort,
    order: "desc",
  };

  if (search) params.search = search;
  if (status && status !== "ALL") params.status = status;
  if (from) params.from = from.toISOString();
  if (to) params.to = to.toISOString();

  const res = await axios.get("/api/requests", { params });
  return res.data;
};
