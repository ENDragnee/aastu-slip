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

    const { id: propertyId } = await params;

    await prisma.property.delete({
      where: {
        id: propertyId,
      },
    });

    return new NextResponse(null, { status: 204 });
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
    const { id: propertyId } = await params;

    const { name, description } = {
      ...body,
      ...(body.name && { name: body.name?.toLowerCase() }),
      ...(body.description && { description: body.description?.toLowerCase() }),
    };

    if (!name && !description) {
      return NextResponse.json(
        { error: "At least one field must be provided" },
        { status: 400 },
      );
    }

    const patchProperty = await prisma.property.update({
      where: {
        id: propertyId,
      },

      data: {
        ...(name && {
          name: name,
        }),
        ...(description && {
          description: description,
        }),
      },
    });

    return NextResponse.json(patchProperty, { status: 200 });
  } catch (err: any) {
    console.error("Unexpected error: ", err);

    if (err.code === "P2025") {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 },
      );
    }
    return NextResponse.json({ error: "Unexpected error: " }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: RouteParam) {
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
    const { id: propertyId } = await params;

    const { name, description } = {
      ...body,
      name: body.name?.toLowerCase(),
      description: body.description?.toLowerCase(),
    };

    if (!name || !description) {
      return NextResponse.json(
        { error: "All field must be provided" },
        { status: 400 },
      );
    }

    const putProperty = await prisma.property.upsert({
      where: {
        id: propertyId,
      },

      update: {
        name: name,
        description: description,
      },

      create: {
        name: name,
        description: description,
      },
    });

    return NextResponse.json(putProperty, { status: 200 });
  } catch (err: any) {
    console.error("Unexpected error: ", err);

    return NextResponse.json({ error: "Unexpected error: " }, { status: 500 });
  }
}
