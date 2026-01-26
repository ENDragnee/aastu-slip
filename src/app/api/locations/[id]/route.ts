import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";
import { getApiSession } from "@/lib/server-auth";
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

    const { id: locationId } = await params;

    if (!locationId) {
      return NextResponse.json(
        { error: "Enter the required fields" },
        { status: 400 },
      );
    }

    const deleteLocation = await prisma.location.delete({
      where: {
        id: locationId,
      },
    });

    return NextResponse.json(deleteLocation, { status: 204 });
  } catch (err) {
    console.error("Unexpected error: ", err);
    return NextResponse.json(
      { error: "Unexpected error: ", err },
      { status: 500 },
    );
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
    const { id: locationId } = await params;

    const { coordinates, description } = {
      ...body,
      description: body.description.toLowerCase(),
    };

    const updateLocation = await prisma.location.update({
      where: {
        id: locationId,
      },

      data: {
        coordinates: coordinates,
        description: description,
      },
    });

    return NextResponse.json(updateLocation, { status: 200 });
  } catch (err) {
    console.error("Unexpected error: ", err);
    return NextResponse.json(
      { error: "Unexpected error: ", err },
      { status: 500 },
    );
  }
}
