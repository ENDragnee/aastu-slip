import { createSchema, createYoga } from "graphql-yoga";
import { adminDashboard } from "@/lib/api/graphql/admin";
import { NextRequest } from "next/server";

const schema = createSchema({
  typeDefs: `
    type BlockStats {
      id: ID!
      name: String
      dormCount: Int 
      activeStudent: Int
    }
    
    type RequestStats {
      total: Int
      today: Int
    }
    
    type Location {
      id: ID!
      description: String
    }
    
    type Gateway {
      id: ID!
      name: String
      status: String
      location: Location
    }

    type DashboardData {
      blocks: [BlockStats]
      requests: RequestStats
      gateways: [Gateway]
    }
    
    type Query {
      adminDashboard: DashboardData
    }
  `,
  resolvers: {
    Query: {
      adminDashboard: adminDashboard,
    },
  },
});

const yoga = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  fetchAPI: {
    Request: Request,
    Response: Response,
  },
});

export async function GET(request: NextRequest, context: any) {
  return yoga.handleRequest(request, context);
}

export async function POST(request: NextRequest, context: any) {
  return yoga.handleRequest(request, context);
}
