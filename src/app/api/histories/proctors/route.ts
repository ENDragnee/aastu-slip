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
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const searchParam = searchParams.get("search");

    const fromDate = fromParam ? new Date(fromParam) : undefined;
    if (fromDate && isNaN(fromDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid 'from' date" },
        { status: 400 },
      );
    }

    const toDate = toParam ? new Date(toParam) : undefined;
    if (toDate && isNaN(toDate.getTime())) {
      return NextResponse.json({ error: "Invalid 'to' date" }, { status: 400 });
    }

    const offset = (page - 1) * limit;

    const histories = await prisma.exit.findMany({
      where: {
        proctorId: session.user.id,
        createdAt: {
          ...(fromDate && { gte: fromDate }),
          ...(toDate && { lte: toDate }),
        },
        ...(searchParam && {
          student: {
            universityId: {
              contains: searchParam,
              mode: "insensitive",
            },
          },
        }),
      },

      include: {
        student: true,
      },

      take: limit,
      skip: offset,
      orderBy: {
        [sort]: order,
      },
    });

    return NextResponse.json(histories, { status: 200 });
  } catch (err: any) {
    console.error("Unexpected error: ", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
