import axios from "axios";
import { GateStat, BlockStat, ExitRequestStat } from "@/types/admin";

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
