import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ExitStatus, Role } from "@/generated/prisma/enums";
import { getApiSession } from "@/lib/server-auth";
import { RouteParam } from "@/types";

export async function GET(request: NextRequest, { params }: RouteParam) {
  try {
    const session = await getApiSession();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "User is not logged in please login to continue!" },
        { status: 401 },
      );
    }
    if (session.user.role !== Role.GATE && session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "User is not an administrator or a gateway user!!" },
        { status: 401 },
      );
    }

    const { searchParams } = request.nextUrl;
    const { id: exitCode } = await params;

    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";

    const exitingStudent = await prisma.exit.findFirst({
      where: {
        exitCode: exitCode,
        currentStatus: ExitStatus.APPROVED,
      },

      include: {
        student: true,
        properties: {
          include: {
            property: true,
          },
        },
        laptops: {
          include: {
            laptop: true,
          },
        },
      },

      orderBy: {
        [sort]: order,
      },
    });

    if (!exitingStudent) {
      return NextResponse.json(
        { message: "The code is invalid" },
        { status: 400 },
      );
    }

    return NextResponse.json(exitingStudent, { status: 200 });
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
    if (session.user.role !== Role.GATE && session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "User is not an administrator or a gateway user!!" },
        { status: 401 },
      );
    }

    const { id: exitCode } = await params;
    const body = await request.json();

    const { exitStatus, note } = await body;
    const approvedStatus = exitStatus as ExitStatus;

    const exit = await prisma.exit.findUnique({ where: { exitCode } });

    if (!exit) {
      return NextResponse.json({ error: "Invalid exit code" }, { status: 404 });
    }

    if (exit.currentStatus !== ExitStatus.APPROVED) {
      return NextResponse.json(
        { error: "Exit not approved yet" },
        { status: 400 },
      );
    }

    const exited = await prisma.exit.update({
      where: {
        exitCode: exitCode,
      },

      data: {
        currentStatus: approvedStatus,
        gateUserId: session.user.id,
        exitEvents: {
          create: {
            status: approvedStatus,
            note: note,
          },
        },
      },

      include: {
        exitEvents: true,
      },
    });

    return NextResponse.json({ exited }, { status: 200 });
  } catch (err) {
    console.error("Unexpected error: ", err);

    if (
      err instanceof Error &&
      "code" in err &&
      (err as any).code === "P2025"
    ) {
      return NextResponse.json(
        { error: "Exit code not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "Unexpected error", err },
      { status: 500 },
    );
  }
}
