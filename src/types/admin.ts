import { GateStatus } from "@/generated/prisma/enums";

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
