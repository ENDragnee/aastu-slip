import { createSchema, createYoga } from "graphql-yoga";
import { adminDashboard } from "@/lib/api/graphql/admin";

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

const { handleRequest } = createYoga({
  schema,
  graphqlEndpoint: "/api/graphql",
  fetchAPI: {
    Request: Request,
    Response: Response,
  },
});

export { handleRequest as GET, handleRequest as POST };
