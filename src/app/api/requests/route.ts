import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/server-auth";
import { randomInt } from "crypto";
import { SelectedItem } from "@/types";
import { ExitStatus, Role } from "@/generated/prisma/enums";

const exitCodeGenerator = () => {
  return String(randomInt(0, 10000)).padStart(6, "0");
};
const TIMEGAP = 24 * 60 * 60 * 1000;

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

    // --- Pagination & Sorting ---
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";

    // --- Filters ---
    const search = searchParams.get("search");
    const statusParam = searchParams.get("status");
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    // Validate Dates
    const fromDate = fromParam ? new Date(fromParam) : undefined;
    if (fromDate && isNaN(fromDate.getTime())) {
      return NextResponse.json(
        { error: "Invalid 'from' date" },
        { status: 400 },
      );
    }

    const toDate = toParam ? new Date(toParam) : undefined;
    if (toDate && isNaN(toDate.getTime())) {
      return NextResponse.json({ error: "Invalid 'to' date" }, { status: 400 });
    }

    const offset = (page - 1) * limit;

    // Fix Sorting: Map 'status' -> 'currentStatus' if needed
    let orderBy: any = {};
    if (sort === "status") {
      orderBy = { currentStatus: order };
    } else {
      orderBy = { [sort]: order };
    }

    const userRequests = await prisma.exit.findMany({
      where: {
        // 1. Search Filter (Student ID)
        ...(search && {
          student: {
            universityId: {
              contains: search,
              mode: "insensitive",
            },
          },
        }),

        // 2. Status Filter
        ...(statusParam && {
          currentStatus: statusParam as ExitStatus,
        }),

        // 3. Date Range Filter
        createdAt: {
          ...(fromDate && { gte: fromDate }),
          ...(toDate && { lte: toDate }),
        },
      },
      include: {
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
        student: true,
      },
      take: limit,
      skip: offset,
      orderBy: orderBy,
    });

    return NextResponse.json(userRequests, { status: 200 });
  } catch (err) {
    console.error("Error fetching requests:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
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

    const result = await prisma.$transaction(async (tx) => {
      const lastRequest = await tx.exit.findFirst({
        where: {
          studentId: userId,
          currentStatus: ExitStatus.REQUESTED,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (lastRequest) {
        const timeDiff = Date.now() - lastRequest.createdAt.getTime();

        if (timeDiff < TIMEGAP) {
          throw new Error("REQUEST_LIMIT");
        }
      }

      return tx.exit.create({
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

          exitEvents: {
            create: {
              status: ExitStatus.REQUESTED,
            },
          },
        },
        include: {
          properties: true,
          laptops: true,
          exitEvents: true,
        },
      });
    });
    return NextResponse.json({ requestExit: result }, { status: 201 });
  } catch (err: any) {
    if (err.message === "REQUEST_LIMIT") {
      return NextResponse.json(
        {
          error: "You already have a pending request within the last 24 hours",
        },
        { status: 403 },
      );
    }

    console.error("Error creating exit request:", err);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
