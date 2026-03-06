import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/server-auth";
import { Role } from "@/generated/prisma/enums";
import { emailQueue } from "@/lib/queue";
import { randomBytes } from "crypto";

export async function GET(request: NextRequest) {
  try {
    const session = await getApiSession();
    if (session?.user?.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const sort = searchParams.get("sort") || "createdAt";
    const order = searchParams.get("order") || "desc";
    const search = searchParams.get("search");
    const role = searchParams.get("role");

    const offset = (page - 1) * limit;

    const whereClause = {
      ...(role && role !== "ALL" && { role: role as Role }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { universityId: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }),
    } as any;

    const users = await prisma.user.findMany({
      where: whereClause,
      take: limit,
      skip: offset,
      orderBy: { [sort]: order },
    });

    const total = await prisma.user.count({ where: whereClause });

    return NextResponse.json({ users, total }, { status: 200 });
  } catch (err) {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getApiSession();
    if (session?.user?.role !== Role.ADMIN)
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = await request.json();
    const { name, universityId, email, phoneNumber, role } = body;

    // 1. Create User
    const user = await prisma.user.create({
      data: {
        name,
        universityId: universityId.toLowerCase(),
        email: email.toLowerCase(),
        phoneNumber,
        role: role as Role,
      },
    });

    // 2. Trigger Onboarding Email (Magic Link)
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: user.email!,
        token,
        expires,
      },
    });

    await emailQueue.add("send-email", {
      email: user.email,
      name: user.name,
      token,
    });

    return NextResponse.json(user, { status: 201 });
  } catch (err: any) {
    // Handle Unique Constraint Violation (P2002)
    if (err.code === "P2002") {
      return NextResponse.json(
        { error: "University ID or Email already exists." },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}
