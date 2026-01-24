import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/server-auth";
import { Role } from "@/generated/prisma/enums";

interface RouteParam {
  params: Promise<{
    id: string[];
  }>;
}

export async function POST(request: NextRequest, { params }: RouteParam) {
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

    const { id } = await params;
    const universityId = id.join("/").toLowerCase();
    const body = await request.json();
    const { serialNumber, model, manufacturer } = {
      ...body,
      serialNumber: body.serialNumber?.toUpperCase(),
      model: body.model?.toUpperCase(),
      manufacturer: body.manufacturer?.toUpperCase(),
    };

    if (!serialNumber || !model || !manufacturer) {
      return NextResponse.json(
        { error: "Some fields are missing:" },
        { status: 400 },
      );
    }

    const registerLaptop = await prisma.laptop.create({
      data: {
        serialNumber: serialNumber,
        model: model,
        manufacturer: manufacturer,
        user: {
          connect: {
            universityId: universityId,
          },
        },
      },
    });

    if (!registerLaptop) {
      return NextResponse.json(
        { error: "The university ID is not vaild" },
        { status: 400 },
      );
    }

    return NextResponse.json({ registerLaptop }, { status: 201 });
  } catch (err) {
    console.error("Unexpected error: ", err);
    return NextResponse.json(
      { error: "Unexpected error: ", err },
      { status: 500 },
    );
  }
}
