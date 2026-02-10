import axios from "axios";
import { AdminLaptop, LaptopFetchParams, LaptopFormData } from "@/types/admin";

export const fetchAdminLaptops = async ({
  page,
  limit,
  sort,
  search,
}: LaptopFetchParams): Promise<AdminLaptop[]> => {
  const params: any = { page, limit, sort, order: "desc" };
  if (search) params.search = search;

  const res = await axios.get("/api/laptops/gateways", { params }); // Reusing gateway endpoint as it returns all laptops for admins
  return res.data.laptops;
};

// Reuse existing gateway registration logic but wrap for admin
export const registerLaptop = async (data: LaptopFormData) => {
  if (!data.universityId) throw new Error("University ID required");
  // The API expects ID in URL: /api/gateways/register-laptops/[id]
  const res = await axios.post(
    `/api/gateways/register-laptops/${data.universityId}`,
    {
      serialNumber: data.serialNumber,
      model: data.model,
      manufacturer: data.manufacturer,
    },
  );
  return res.data;
};

export const updateLaptop = async (
  id: string,
  data: Partial<LaptopFormData>,
) => {
  const res = await axios.patch(`/api/laptops/${id}`, data);
  return res.data;
};

export const deleteLaptop = async (id: string) => {
  const res = await axios.delete(`/api/laptops/${id}`);
  return res.data;
};
