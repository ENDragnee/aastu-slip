import axios from "axios";
import { LaptopRecord, LaptopFetchParams } from "@/types/laptop";

export const fetchLaptops = async ({
  page,
  limit,
  sort,
  search,
}: LaptopFetchParams): Promise<LaptopRecord[]> => {
  const params: any = { page, limit, sort, order: "desc" };
  if (search) params.search = search;

  const res = await axios.get("/api/laptops/gateways", { params });
  return res.data.laptops;
};

export const registerLaptop = async (
  universityId: string,
  data: { serialNumber: string; model: string; manufacturer: string },
) => {
  // Use encodeURIComponent to handle slashes in University IDs (e.g. ETS/1234)
  // But wait, Next.js catch-all routes [...id] handle slashes naturally by splitting them.
  // We simply pass the raw ID string, and axios will construct the URL.
  // Note: If ID is "ETS/1234/14", the URL becomes /api/.../ETS/1234/14

  const res = await axios.post(
    `/api/gateways/register-laptops/${universityId}`,
    data,
  );
  return res.data;
};
