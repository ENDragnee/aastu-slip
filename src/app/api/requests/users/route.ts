import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getApiSession();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "User is not logged in please login to continue!" },
        { status: 401 },
      );
    }

    const { searchParams } = request.nextUrl;

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";
    const searchParam = searchParams.get("search");

    const offset = (page - 1) * limit;

    let orderBy: any = {};

    if (sort === "status") {
      orderBy = { currentStatus: order };
    } else {
      orderBy = { [sort]: order };
    }

    const userRequests = await prisma.exit.findMany({
      where: {
        studentId: session.user.id,
        ...(searchParam && {
          exitCode: {
            contains: searchParam,
            mode: "insensitive",
          },
        }),
      },

      include: {
        laptops: {
          include: {
            laptop: true,
          },
        },

        properties: {
          include: {
            property: true,
          },
        },

        student: true,
      },
      take: limit,
      skip: offset,
      orderBy: orderBy,
    });
    return NextResponse.json(userRequests, { status: 200 });
  } catch (err) {
    console.error("Error fetching requests:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
