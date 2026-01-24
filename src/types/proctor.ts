// src/types/proctor.ts
import { ExitStatus, Role } from "@/generated/prisma/enums";

export interface PropertyItem {
  property: {
    id: string;
    name: string;
    description: string;
  };
  quantity: number;
}

export interface LaptopItem {
  laptop: {
    id: string;
    serialNumber: string;
    model: string;
    manufacturer: string;
  };
}

export interface StudentInfo {
  id: string;
  name: string;
  universityId: string;
  email: string;
  phoneNumber: string;
  dorms: {
    dorm: {
      number: number;
      block: {
        name: string;
      };
    };
  }[];
}

export interface ExitRequestData {
  id: string;
  currentStatus: ExitStatus;
  exitCode: string;
  createdAt: string;
  studentId: string;
  student: StudentInfo;
  properties: PropertyItem[];
  laptops: LaptopItem[];
}

export interface HistoryRecord {
  id: string;
  currentStatus: ExitStatus;
  exitCode: string;
  studentId: string;
  proctorId: string;
  gateUserId: string | null;
  createdAt: string;
  updatedAt: string;
  student: Omit<StudentInfo, "dorm">;
}

export interface HistoryFetchParams {
  page: number;
  limit: number;
  sort: string;
  from?: Date;
  to?: Date;
  search?: string;
}
