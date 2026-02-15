import axios from "axios";
import { GateStatus } from "@/generated/prisma/enums";

export interface DashboardGraphQLResponse {
  data: {
    adminDashboard: {
      blocks: {
        id: string;
        name: string;
        dormCount: number;
        activeStudent: number;
      }[];
      requests: {
        total: number;
        today: number;
      };
      gateways: {
        id: string;
        name: string;
        status: GateStatus;
        location: {
          description: string;
        };
      }[];
    };
  };
}

export const fetchAdminDashboardGraphQL = async () => {
  const query = `
    query DashboardData {
      adminDashboard {
        blocks {
          id
          name
          dormCount
          activeStudent
        }
        requests {
          total
          today
        }
        gateways {
          id
          name
          status
          location {
            description
          }
        }
      }
    }
  `;

  const res = await axios.post<DashboardGraphQLResponse>("/api/graphql", {
    query,
  });

  return res.data.data.adminDashboard;
};
