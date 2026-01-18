import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/server-auth";
import { Role, ExitStatus } from "@/generated/prisma/enums";
import { RouteParam } from "@/types";

export async function PATCH(request: NextRequest, { params }: RouteParam) {
  try {
    const session = await getApiSession();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "User is not logged in please login to continue!" },
        { status: 401 },
      );
    }
    if (
      session.user.role !== Role.PROCTOR &&
      session.user.role !== Role.ADMIN
    ) {
      return NextResponse.json(
        { error: "User is not an administrator or a proctor!!" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { id: userId } = await params;

    const { requestId, exitStatus, note } = body;
    const approvedStatus = exitStatus as ExitStatus;

    const approvedExit = await prisma.exit.update({
      where: {
        id: requestId,
        studentId: userId,
      },

      data: {
        currentStatus: approvedStatus,
        proctorId: session.user.id,
        exitEvents: {
          create: {
            status: approvedStatus,
            note: note || "",
          },
        },
      },

      include: {
        exitEvents: true,
      },
    });

    return NextResponse.json(approvedExit, { status: 201 });
  } catch (err) {
    console.error("Error creating exit request:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
