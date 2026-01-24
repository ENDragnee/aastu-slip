import { ExitStatus } from "@/generated/prisma/enums";

export interface GatewayStudent {
  name: string;
  universityId: string;
  email: string;
  phoneNumber: string | null;
}

export interface GatewayProperty {
  property: {
    name: string;
    description: string;
  };
  quantity: number;
}

export interface GatewayLaptop {
  laptop: {
    serialNumber: string;
    model: string;
    manufacturer: string;
  };
}

export interface GatewayExitData {
  id: string;
  currentStatus: ExitStatus;
  exitCode: string;
  student: GatewayStudent;
  properties: GatewayProperty[];
  laptops: GatewayLaptop[];
  createdAt: string;
}
