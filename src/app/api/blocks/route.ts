import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";
import { getApiSession } from "@/lib/server-auth";

export const GET = async (request: NextRequest) => {
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
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";
    const search = searchParams.get("search");

    const offset = (page - 1) * limit;

    const fetchBlocks = await prisma.block.findMany({
      where: {
        ...(search && {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }),
      },

      take: limit,
      skip: offset,
      orderBy: {
        [sort]: order,
      },
    });

    return NextResponse.json({ fetchBlocks }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error: ", err);
    return NextResponse.json(
      { error: "Unexpected error: ", err },
      { status: 500 },
    );
  }
};

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
    const { name, locationId } = {
      ...body,
      name: body.name.toUpperCase(),
    };

    if (!name) {
      return NextResponse.json(
        { error: "Name for the block is not given" },
        { status: 400 },
      );
    }

    const createBlock = await prisma.block.create({
      data: {
        name: name,
        locationId: locationId,
      },
    });

    if (!createBlock) {
      return NextResponse.json(
        { error: "Error creating a block" },
        { status: 400 },
      );
    }

    return NextResponse.json(createBlock, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected error: ", err },
      { status: 500 },
    );
  }
}
