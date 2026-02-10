import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/server-auth";
import { Role, DormStatus } from "@/generated/prisma/enums";
import { RouteParam } from "@/types";

export async function DELETE(request: NextRequest, { params }: RouteParam) {
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

    const { id: dormId } = await params;

    if (!dormId) {
      return NextResponse.json(
        { error: "Enter the required fields" },
        { status: 400 },
      );
    }

    await prisma.dormitory.delete({
      where: {
        id: dormId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("Unexpected error: ", err);
    return NextResponse.json({ error: "Unexpected error: " }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParam) {
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
    const { id: dormId } = await params;

    const { number, status, blockId } = {
      ...body,
      ...(body.number && { number: parseInt(body?.number) }),
      ...(body.status && { status: body.status.toUpperCase() as DormStatus }),
    };

    if (!number && !blockId && !status) {
      return NextResponse.json(
        { error: "Enter the required fields" },
        { status: 400 },
      );
    }

    const updateDorm = await prisma.dormitory.update({
      where: {
        id: dormId,
      },

      data: {
        ...(number && { number: number }),
        ...(blockId && { blockId: blockId }),
        ...(status && { status: status }),
      },
    });

    return NextResponse.json(updateDorm, { status: 200 });
  } catch (err) {
    console.error("Unexpected error: ", err);
    return NextResponse.json(
      { error: "Unexpected error: ", err },
      { status: 500 },
    );
  }
}
