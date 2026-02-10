import { ExitStatus } from "@/generated/prisma/enums";

export interface AdminEventRecord {
  id: string;
  status: ExitStatus;
  note: string | null;
  at: string;
  exit: {
    id: string;
    exitCode: string;
    student: {
      name: string;
      universityId: string;
    };
    proctor?: {
      name: string;
    };
    gateUser?: {
      name: string;
    };
  };
}

export interface EventFetchParams {
  page: number;
  limit: number;
  sort: string;
  search?: string;
}
