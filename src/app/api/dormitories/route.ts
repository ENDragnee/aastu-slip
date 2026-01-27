import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/server-auth";
import { Role, DormStatus } from "@/generated/prisma/enums";

export async function GET(request: NextRequest) {
  try {
    const session = await getApiSession();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "User is not logged in please login to continue!" },
        { status: 401 },
      );
    }
    if (session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "User is not an administrator user!!" },
        { status: 403 },
      );
    }

    const { searchParams } = request.nextUrl;
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";
    const search  = searchParams.get("search")

    const offset = ( page - 1 ) * limit;

    const dorms = await prisma.dormitory.findMany({
      where: {
        ...(search && {
          block: {
            name: {
              contains: search,
              mode: "insensitive"
            }
          }
        })
      },

      include: {
        block: true
      },

      take: limit,
      skip: offset,
      orderBy: {
        [sort]: order
      }
    });

    return NextResponse.json(dorms, { status: 200 });
  } catch (err) {
    console.error("Unexpected error: ", err);
    return NextResponse.json(
      { error: "Unexpected error: ", err },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getApiSession();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "User is not logged in please login to continue!" },
        { status: 401 },
      );
    }
    if (session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "User is not an administrator user!!" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { number, status, blockId } = {
      ...body,
      number: parseInt(body?.number),
      status: body.status as DormStatus,
    };

    if (!number || !blockId) {
      return NextResponse.json(
        { error: "Enter the required fields" },
        { status: 400 },
      );
    }

    const createDorm = await prisma.dormitory.create({
      data: {
        number: number,
        blockId: blockId,
        ...(status && { status: status }),
      },
    });

    return NextResponse.json(createDorm, { status: 201 });
  } catch (err) {
    console.error("Unexpected error: ", err);
    return NextResponse.json(
      { error: "Unexpected error: ", err },
      { status: 500 },
    );
  }
}
