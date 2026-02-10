import { GateStatus, ExitStatus, DormStatus } from "@/generated/prisma/enums";

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

export interface Block {
  id: string;
  name: string;
  locationId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface BlockFetchParams {
  page: number;
  limit: number;
  sort: string;
  search?: string;
}

export interface BlockFormData {
  name: string;
  locationId?: string;
}

export interface Dorm {
  id: string;
  number: number;
  status: DormStatus;
  blockId: string;
  createdAt: string;
  updatedAt: string;
  block: {
    id: string;
    name: string;
  };
}

export interface DormFetchParams {
  page: number;
  limit: number;
  sort: string;
  search?: string; // Block name search
}

export interface DormFormData {
  number: number;
  status: DormStatus;
  blockId: string;
}

export interface Location {
  id: string;
  coordinates: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocationFetchParams {
  page: number;
  limit: number;
  sort: string;
  search?: string; // Description search (implied by your API logic?)
}

export interface LocationFormData {
  coordinates: string;
  description: string;
}

export interface Gate {
  id: string;
  name: string;
  status: GateStatus;
  locationId: string | null;
  createdAt: string;
  updatedAt: string;
  location?: {
    id: string;
    coordinates: string;
    description: string;
  };
}

export interface GateFetchParams {
  page: number;
  limit: number;
  sort: string;
  search?: string;
}

export interface GateFormData {
  name: string;
  status: GateStatus;
  locationId: string;
}

export interface AdminLaptop {
  id: string;
  serialNumber: string;
  model: string;
  manufacturer: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    universityId: string;
    email: string;
  };
}

export interface LaptopFetchParams {
  page: number;
  limit: number;
  sort: string;
  search?: string; // Student University ID search
}

export interface LaptopFormData {
  universityId?: string; // Only needed for creation
  serialNumber: string;
  model: string;
  manufacturer: string;
}
