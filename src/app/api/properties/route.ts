import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    return NextResponse.json({ properties }, { status: 200 });
  } catch (error) {
    console.error("Error getting list of properties", error);
    return NextResponse.json({ error }, { status: 400 });
  }
}
