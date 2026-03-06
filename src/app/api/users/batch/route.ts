import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/server-auth";
import { Role } from "@/generated/prisma/enums";
import { emailQueue } from "@/lib/queue";
import { randomBytes } from "crypto";
import { parse } from "papaparse";
import { z } from "zod";

const UserCsvSchema = z.object({
  name: z.string().min(2),
  universityId: z.string().min(3),
  email: z.email(),
  role: z.enum(Role).optional().default(Role.STUDENT),
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

  let processed = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const row of data as any[]) {
    const parsed = UserCsvSchema.safeParse(row);
    if (!parsed.success) {
      failed++;
      errors.push(`Invalid row format: ${row.universityId || "Unknown"}`);
      continue;
    }

    const { name, universityId, email, role, phoneNumber } = parsed.data;

    try {
      // 1. Create/Update User
      const user = await prisma.user.upsert({
        where: { universityId: universityId.toLowerCase() },
        update: { name, email: email.toLowerCase(), role, phoneNumber },
        create: {
          name,
          universityId: universityId.toLowerCase(),
          email: email.toLowerCase(),
          role,
          phoneNumber,
        },
      });

      // 2. Check if account exists, if not -> Send Invite
      const account = await prisma.account.findFirst({
        where: { userId: user.id },
      });

      if (!account) {
        // Clear old tokens to avoid duplicates
        await prisma.verificationToken.deleteMany({
          where: { identifier: email },
        });

        const token = randomBytes(32).toString("hex");
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

        await prisma.verificationToken.create({
          data: { identifier: email.toLowerCase(), token, expires },
        });

        await emailQueue.add("send-email", {
          email: user.email,
          name: user.name,
          token,
        });
      }
      processed++;
    } catch (err: any) {
      failed++;
      errors.push(`Error for ${universityId}: ${err.message}`);
    }
  }

  return NextResponse.json({
    success: true,
    processed,
    failed,
    errors: errors.slice(0, 50),
  });
}
