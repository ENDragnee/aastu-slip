import { GateStatus, ExitStatus } from "@/generated/prisma/enums";

export interface GateStat {
  id: string;
  name: string;
  status: GateStatus;
  location: {
    description: string;
  };
}

export interface BlockStat {
  id: string;
  name: string;
  dormCount: number;
  activeStudents: number;
}

export interface ExitRequestStat {
  id: string;
  currentStatus: string;
  createdAt: string;
}

export interface AdminRequestRecord {
  id: string;
  currentStatus: ExitStatus;
  exitCode: string;
  createdAt: string;
  student: {
    name: string;
    universityId: string;
    email: string;
  };
  laptops: {
    laptop: { manufacturer: string; model: string; serialNumber: string };
  }[];
  properties: { quantity: number; property: { name: string } }[];
}

export interface AdminRequestParams {
  page: number;
  limit: number;
  sort: string;
  search?: string;
  status?: string; // Optional filter
  from?: Date;
  to?: Date;
}
