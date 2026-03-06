import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { emailQueue } from "@/lib/queue";
import { getApiSession } from "@/lib/server-auth";
import { Role } from "@/generated/prisma/enums";
import { randomBytes } from "crypto";
import { parse } from "papaparse";
import { z } from "zod";

const UserCsvSchema = z.object({
  name: z.string(),
  universityId: z.string(),
  email: z.email(),
  phoneNumber: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const session = await getApiSession();
  if (session?.user?.role !== Role.ADMIN)
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const formData = await request.formData();
  const file = formData.get("file") as File;
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

  const text = await file.text();
  const { data } = parse(text, { header: true, skipEmptyLines: true });

  let successCount = 0;

  for (const row of data as any[]) {
    const parsed = UserCsvSchema.safeParse(row);
    if (!parsed.success) continue;

    const { name, universityId, email, phoneNumber } = parsed.data;

    // 1. Create/Update User
    const user = await prisma.user.upsert({
      where: { universityId: universityId.toLowerCase() },
      update: {},
      create: {
        name,
        universityId: universityId.toLowerCase(),
        email: email.toLowerCase(),
        phoneNumber,
        role: Role.STUDENT,
      },
    });

    // 2. Generate Magic Token
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await prisma.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token,
        expires,
      },
    });

    // 3. Add to Queue
    await emailQueue.add("send-email", {
      email: user.email,
      name: user.name,
      token,
    });

    successCount++;
  }

  return NextResponse.json({ success: true, count: successCount });
}
