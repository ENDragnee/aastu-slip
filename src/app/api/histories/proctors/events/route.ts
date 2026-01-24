import { NextResponse, NextRequest } from "next/server";
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
    const searchParam = searchParams.get("search");

    let orderBy: any = {};

    if (sort === "status") {
      orderBy = { status: order };
    } else if (sort === "createdAt" || sort === "at") {
      orderBy = { at: order };
    } else {
      orderBy = {
        exit: {
          [sort]: order,
        },
      };
    }

    const offset = (page - 1) * limit;

    const histories = await prisma.exitEvent.findMany({
      where: {
        exit: {
          proctorId: session.user.id,
          ...(searchParam && {
            student: {
              universityId: {
                contains: searchParam,
                mode: "insensitive",
              },
            },
          }),
        },
      },
      include: {
        exit: {
          include: {
            student: true,
          },
        },
      },

      take: limit,
      skip: offset,
      orderBy: orderBy,
    });

    return NextResponse.json(histories, { status: 200 });
  } catch (err: any) {
    console.error("Unexpected error: ", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
