import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getApiSession();

    if (!session?.user) {
      return NextResponse.json(
        { error: "You must be logged in to access this resource" },
        { status: 401 },
      );
    }

    const userId: string = session.user.id;

    const laptops = await prisma.laptop.findMany({
      where: {
        userId: userId,
      },
    });

    return NextResponse.json(laptops);
  } catch (error) {
    console.error("Failed to fetch laptops:", error);

    // In development you can send more info, in production maybe just generic message
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
