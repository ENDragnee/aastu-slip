import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/server-auth";
import { Role, GateStatus } from "@/generated/prisma/enums";
import { RouteParam } from "@/types";

export async function DELETE({ params }: RouteParam) {
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

    const { id: gateId } = await params;

    if (!gateId) {
      return NextResponse.json(
        { error: "Enter the required fields" },
        { status: 400 },
      );
    }

    const deleteGate = await prisma.gate.delete({
      where: {
        id: gateId,
      },
    });

    return NextResponse.json(deleteGate, { status: 204 });
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
    const { id: gateId } = await params;

    const { name, status, locationId } = {
      ...body,
      name: body?.number.toUpperCase(),
      status: body.status as GateStatus,
    };

    if (!name && !locationId && !status) {
      return NextResponse.json(
        { error: "Enter the required fields" },
        { status: 400 },
      );
    }

    const updateGate = await prisma.gate.update({
      where: {
        id: gateId,
      },

      data: {
        ...(name && { name: name }),
        ...(locationId && { locationId: locationId }),
        ...(status && { status: status }),
      },
    });

    return NextResponse.json(updateGate, { status: 200 });
  } catch (err) {
    console.error("Unexpected error: ", err);
    return NextResponse.json(
      { error: "Unexpected error: ", err },
      { status: 500 },
    );
  }
}
