import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/server-auth";
import { randomInt } from "crypto";
import { SelectedItem } from "@/types";
import { Role } from "@/generated/prisma/enums";

const exitCodeGenerator = () => {
  return String(randomInt(0, 10000)).padStart(6, "0");
};

export async function GET(request: NextRequest) {
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
        { error: "User is not an administrator!" },
        { status: 401 },
      );
    }

    const { searchParams } = request.nextUrl;

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";

    const offset = (page - 1) * limit;

    const userRequests = await prisma.exit.findMany({
      take: limit,
      skip: offset,
      orderBy: {
        [sort]: order,
      },
    });
    return NextResponse.json(userRequests, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected error: ", err },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getApiSession();
    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "User is not logged in please login to continue!" },
        { status: 401 },
      );
    }
    const body = await request.json();
    const data = body.exitRequest || body;

    const items: SelectedItem[] = Array.isArray(data.items) ? data.items : [];
    const laptops: string[] = Array.isArray(data.laptops) ? data.laptops : [];
    const userId = session?.user?.id;

    const propertyData = items
      .filter((item) => item.id)
      .map((item) => ({
        propertyId: item.id!,
        quantity: item.quantity,
      }));

    const laptopData = laptops.map((laptopId) => ({
      laptopId: laptopId,
    }));

    const requestExit = await prisma.exit.create({
      data: {
        studentId: userId,
        exitCode: exitCodeGenerator(),

        properties: {
          createMany: {
            data: propertyData,
          },
        },

        laptops: {
          createMany: {
            data: laptopData,
          },
        },
      },
      include: {
        properties: true,
        laptops: true,
      },
    });
    return NextResponse.json({ requestExit }, { status: 201 });
  } catch (err) {
    console.error("Error creating exit request:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
