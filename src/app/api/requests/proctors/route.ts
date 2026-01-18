import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/server-auth";
import { Role } from "@/generated/prisma/enums";

export async function GET(request: NextRequest) {
  try {
    const session = await getApiSession();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "User is not logged in please login to continue!" },
        { status: 401 },
      );
    }
    if (
      session.user.role !== Role.PROCTOR &&
      session.user.role !== Role.ADMIN
    ) {
      return NextResponse.json(
        { error: "User is not an administrator or a proctor!!" },
        { status: 401 },
      );
    }

    const { searchParams } = request.nextUrl;

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";

    const offset = (page - 1) * limit;
    const proctor = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        blockId: true,
      },
    });

    if (!proctor?.blockId) {
      throw new Error("Proctor has no assigned block");
    }

    const userRequests = await prisma.exit.findMany({
      where: {
        currentStatus: "REQUESTED",
        student: {
          dorms: {
            some: {
              isActive: true,
              dorm: {
                block: {
                  id: proctor.blockId,
                },
              },
            },
          },
        },
      },
      include: {
        student: {
          include: {
            dorms: {
              where: { isActive: true },
              include: {
                dorm: {
                  include: {
                    block: true,
                  },
                },
              },
            },
          },
        },
        properties: {
          include: {
            property: true,
          },
        },
        laptops: {
          include: {
            laptop: true,
          },
        },
      },
      take: limit,
      skip: offset,
      orderBy: {
        [sort]: order,
      },
    });
    return NextResponse.json(userRequests, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected error: ", err },
      { status: 500 },
    );
  }
}
