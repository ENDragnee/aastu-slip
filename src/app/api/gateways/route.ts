import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/server-auth";
import { Role, GateStatus } from "@/generated/prisma/enums";

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
    const search = searchParams.get("search");

    const offset = (page - 1) * limit;

    const gates = await prisma.gate.findMany({
      where: {
        ...(search && {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }),
      },

      include: {
        location: true,
      },

      take: limit,
      skip: offset,
      orderBy: {
        [sort]: order,
      },
    });

    return NextResponse.json(gates, { status: 200 });
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
    const { name, status, locationId } = {
      ...body,
      name: body?.number.toUpperCase(),
      status: body.status as GateStatus,
    };

    if (!name) {
      return NextResponse.json(
        { error: "Enter the required fields" },
        { status: 400 },
      );
    }

    const createGate = await prisma.gate.create({
      data: {
        name: name,
        locationId: locationId,
        ...(status && { status: status }),
      },
    });

    return NextResponse.json(createGate, { status: 201 });
  } catch (err) {
    console.error("Unexpected error: ", err);
    return NextResponse.json(
      { error: "Unexpected error: ", err },
      { status: 500 },
    );
  }
}
