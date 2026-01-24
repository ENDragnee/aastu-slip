import { ExitStatus } from "@/generated/prisma/enums";

export interface StudentRequestItem {
  id: string;
  currentStatus: ExitStatus;
  exitCode: string;
  createdAt: string;
  laptops: {
    laptop: {
      manufacturer: string;
      model: string;
      serialNumber: string;
    };
  }[];
  properties: {
    quantity: number;
    property: {
      name: string;
    };
  }[];
}

export interface RequestFetchParams {
  page: number;
  limit: number;
  sort: string;
  search?: string;
}
