import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/server-auth";
import { Role } from "@/generated/prisma/enums";
import { RouteParam } from "@/types";

export async function GET(request: NextRequest, { params }: RouteParam) {
  try {
    const session = await getApiSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to access this resource" },
        { status: 401 },
      );
    }

    const { id: userId } = await params;

    if (userId !== session.user.id && session.user.role !== Role.ADMIN) {
      console.log(session.user.id);
      return NextResponse.json(
        { error: "You are not authorized to view this user's laptops" },
        { status: 403 },
      );
    }

    const laptops = await prisma.laptop.findMany({
      where: {
        userId: userId,
      },
    });

    return NextResponse.json(laptops);
  } catch (error) {
    console.error("Failed to fetch laptops:", error);

    const errorMessage =
      process.env.NODE_ENV === "development"
        ? (error as Error).message
        : "Internal server error";

    return NextResponse.json(
      { error: "Failed to fetch laptops", details: errorMessage },
      { status: 500 },
    );
  }
}
