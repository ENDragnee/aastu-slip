import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";
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
    if (session.user.role !== Role.GATE && session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "User is not an administrator or a gateway user!!" },
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

    const laptops = await prisma.laptop.findMany({
      where: {
        user: {
          ...(searchParam && {
            universityId: {
              contains: searchParam,
              mode: "insensitive",
            },
          }),
        },
      },

      include: {
        user: true,
      },

      take: limit,
      skip: offset,
      orderBy: {
        [sort]: order,
      },
    });

    return NextResponse.json({ laptops }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error", err);

    return NextResponse.json(
      { error: "Unexpected error", err },
      { status: 500 },
    );
  }
}
