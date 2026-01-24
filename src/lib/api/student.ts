import axios from "axios";
import { StudentRequestItem, RequestFetchParams } from "@/types/student";

export const fetchStudentRequests = async ({
  page,
  limit,
  sort,
  search,
}: RequestFetchParams): Promise<StudentRequestItem[]> => {
  const params: any = {
    page,
    limit,
    sort,
    order: "desc", // Default to descending for newest first
  };

  if (search) params.search = search;

  // Assuming your API route is at /api/requests/student
  // (You might need to adjust the path based on your file structure)
  const res = await axios.get("/api/requests/users", { params });
  return res.data;
};
