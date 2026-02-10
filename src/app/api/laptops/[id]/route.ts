import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/server-auth";
import { Role } from "@/generated/prisma/enums";
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

    const { id: laptopId } = await params;

    if (!laptopId) {
      return NextResponse.json(
        { error: "Enter the required fields" },
        { status: 400 },
      );
    }

    await prisma.laptop.delete({
      where: {
        id: laptopId,
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
    const { id: laptopId } = await params;

    const { serialNumber, model, manufacturer } = {
      ...body,
      ...(body.model && { model: body.model.toUpperCase() }),
      ...(body.manufacturer && {
        manufacturer: body.manufacturer.toUpperCase(),
      }),
      ...(body.serialNumber && {
        serialNumber: body.serialNumber.toUpperCase(),
      }),
    };

    if (!serialNumber && !model && !manufacturer) {
      return NextResponse.json(
        { error: "Enter the required fields" },
        { status: 400 },
      );
    }

    const updateLaptop = await prisma.laptop.update({
      where: {
        id: laptopId,
      },

      data: {
        ...(model && { model: model }),
        ...(manufacturer && { manufacturer: manufacturer }),
        ...(serialNumber && { serialNumber: serialNumber }),
      },
    });

    return NextResponse.json(updateLaptop, { status: 200 });
  } catch (err) {
    console.error("Unexpected error: ", err);
    return NextResponse.json(
      { error: "Unexpected error: ", err },
      { status: 500 },
    );
  }
}
