import axios from "axios";
import { GatewayExitData } from "@/types/gateway";
import { ExitStatus } from "@/generated/prisma/enums";

export const fetchExitByCode = async (
  code: string,
): Promise<GatewayExitData> => {
  const res = await axios.get(`/api/requests/gateways/${code}`);
  return res.data;
};

export const updateExitStatus = async (
  exitCode: string,
  status: ExitStatus,
  note: string = "",
) => {
  const res = await axios.patch(`/api/requests/gateways/${exitCode}`, {
    exitStatus: status,
    note,
  });
  return res.data;
};
