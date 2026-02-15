import { GraphQLError } from "graphql";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/server-auth";
import { Role } from "@/generated/prisma/enums";

export const adminDashboard = async () => {
  try {
    const session = await getApiSession();

    if (!session || !session.user?.id) {
      throw new GraphQLError("User is not logged in", {
        extensions: { code: "UNAUTHENTICATED", http: { status: 401 } },
      });
    }
    if (session.user.role !== Role.ADMIN) {
      throw new GraphQLError("User is not an administrator", {
        extensions: { code: "FORBIDDEN", http: { status: 403 } },
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [gatewaysData, totalExits, todayExits, blocksData] =
      await prisma.$transaction([
        prisma.gate.findMany({
          select: {
            id: true,
            name: true,
            status: true,
            location: {
              select: { id: true, description: true },
            },
          },
        }),

        prisma.exit.count(),

        prisma.exit.count({
          where: {
            createdAt: { gte: today, lt: tomorrow },
          },
        }),

        prisma.block.findMany({
          select: {
            id: true,
            name: true,
            _count: { select: { dorms: true } },
            dorms: {
              select: {
                _count: {
                  select: {
                    users: { where: { isActive: true } },
                  },
                },
              },
            },
          },
        }),
      ]);

    const formattedBlocks = blocksData.map((block) => ({
      id: block.id,
      name: block.name,
      dormCount: block._count.dorms,
      activeStudent: block.dorms.reduce((sum, d) => sum + d._count.users, 0),
    }));

    return {
      blocks: formattedBlocks,
      gateways: gatewaysData,
      requests: {
        total: totalExits,
        today: todayExits,
      },
    };
  } catch (err) {
    console.error(err);
    throw new GraphQLError("Internal Server Error", {
      extensions: { code: "INTERNAL_SERVER_ERROR", http: { status: 500 } },
    });
  }
};
