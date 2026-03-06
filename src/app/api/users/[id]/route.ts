import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/server-auth";
import { Role } from "@/generated/prisma/enums";
import { RouteParam } from "@/types";

export async function PATCH(request: NextRequest, { params }: RouteParam) {
  const session = await getApiSession();
  if (session?.user?.role !== Role.ADMIN)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body = await request.json();

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: body.name,
        universityId: body.universityId?.toLowerCase(),
        email: body.email?.toLowerCase(),
        phoneNumber: body.phoneNumber,
        role: body.role as Role,
      },
    });
    return NextResponse.json(updatedUser);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParam) {
  const session = await getApiSession();
  if (session?.user?.role !== Role.ADMIN)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  // Prevent self-deletion
  if (id === session.user.id) {
    return NextResponse.json(
      { error: "Cannot delete yourself" },
      { status: 400 },
    );
  }

  try {
    await prisma.user.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}
