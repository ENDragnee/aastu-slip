import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";
import { getApiSession } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getApiSession();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "User is not logged in please login to continue!" },
        { status: 401 },
      );
    }
    if (session.user.role != Role.ADMIN) {
      return NextResponse.json(
        { error: "User is not an administrator user!!" },
        { status: 403 },
      );
    }

    const { searchParams } = request.nextUrl;
    const search = searchParams.get("search");

    const blocks = await prisma.block.findMany({
      where: {
        ...(search && {
          name: {
            contains: search,
            mode: "insensitive",
          },
        }),
      },
      select: {
        id: true,
        name: true,

        _count: {
          select: {
            dorms: true,
          },
        },

        dorms: {
          select: {
            _count: {
              select: {
                users: {
                  where: {
                    isActive: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    const result = blocks.map((block) => ({
      id: block.id,
      name: block.name,
      dormCount: block._count.dorms,
      activeStudents: block.dorms.reduce((sum, d) => sum + d._count.users, 0),
    }));

    return NextResponse.json(result, { status: 200 });
  } catch (err) {
    console.error("Unexpected error: ", err);
    NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}
