import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hash_password } from "@/lib/password-utils";

export async function POST(request: NextRequest) {
  const { token, password } = await request.json();

  // 1. Validate Token
  const verification = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!verification || verification.expires < new Date()) {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 400 },
    );
  }

  // 2. Find User
  const user = await prisma.user.findUnique({
    where: { email: verification.identifier },
  });

  if (!user)
    return NextResponse.json({ error: "User not found" }, { status: 404 });

  // 3. Set Password
  const hashedPassword = await hash_password(password);

  await prisma.$transaction([
    prisma.account.create({
      data: {
        userId: user.id,
        password: hashedPassword,
      },
    }),
    // Delete token so it can't be used again
    prisma.verificationToken.delete({ where: { token } }),
  ]);

  return NextResponse.json({ success: true });
}
