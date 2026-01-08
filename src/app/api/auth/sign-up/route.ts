import { NextRequest, NextResponse } from "next/server";
import { hash_password } from "@/lib/password-utils";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      firstName,
      lastName,
      universityId,
      block,
      email,
      password,
      phoneNumber,
    } = body;

    if (
      !firstName ||
      !lastName ||
      !universityId ||
      !block ||
      !email ||
      !password ||
      !phoneNumber
    ) {
      return NextResponse.json(
        { error: "The fields are not complete", body },
        { status: 400 },
      );
    }
    const hashedPassword = await hash_password(password);
    const blockRecord = await prisma.block.findUnique({
      where: {
        name: block,
      },
    });

    if (!blockRecord) {
      return NextResponse.json({ error: "Invalid block" }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        name: firstName + " " + lastName,
        email: email,
        role: Role.STUDENT,
        universityId: universityId,
        phoneNumber: phoneNumber,
        blockId: blockRecord?.id,
        accounts: {
          create: {
            password: hashedPassword,
          },
        },
      },
      include: {
        accounts: true,
        sessions: false,
      },
    });

    return NextResponse.json({ newUser }, { status: 201 });
  } catch (error) {
    console.error("Error during signup: ", error);
    NextResponse.json({ error: "Unexpected error in signup" }, { status: 500 });
  }
}
