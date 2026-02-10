import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/server-auth";
import { Role } from "@/generated/prisma/enums";

export async function GET(request: NextRequest) {
  try {
    const session = await getApiSession();

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Allow Proctors and Admins
    if (
      session.user.role !== Role.PROCTOR &&
      session.user.role !== Role.ADMIN
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = request.nextUrl;

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";
    const searchParam = searchParams.get("search");

    const offset = (page - 1) * limit;

    // Sorting Logic
    let orderBy: any = {};
    if (sort === "status") {
      orderBy = { status: order };
    } else if (sort === "createdAt" || sort === "at") {
      orderBy = { at: order };
    } else {
      orderBy = { exit: { [sort]: order } };
    }

    // Filter Logic
    const isAdmin = session.user.role === Role.ADMIN;

    const whereClause: any = {
      exit: {
        ...(!isAdmin && { proctorId: session.user.id }), // Restrict for non-admins
        ...(searchParam && {
          student: {
            universityId: {
              contains: searchParam,
              mode: "insensitive",
            },
          },
        }),
      },
    };

    const histories = await prisma.exitEvent.findMany({
      where: whereClause,
      include: {
        exit: {
          include: {
            student: {
              select: { id: true, name: true, universityId: true },
            },
            proctor: {
              select: { name: true },
            },
            gateUser: {
              select: { name: true },
            },
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
