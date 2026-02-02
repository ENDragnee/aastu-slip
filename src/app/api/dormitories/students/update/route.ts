import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/server-auth";
import { Role } from "@/generated/prisma/enums";
import { parse } from "csv-parse";
import { z } from "zod";
import { Readable } from "stream";

const UserDormitorySchema = z.object({
  studentId: z.string().trim(),
  block: z.string().trim(),
  dormNumber: z.coerce.number(),
  validUntil: z.coerce.date().optional(),
});

type UserDormitoryInput = z.infer<typeof UserDormitorySchema>;

const BATCH_SIZE = 100;

export async function POST(request: NextRequest) {
  try {
    const session = await getApiSession();
    if (!session || session.user?.role !== Role.ADMIN) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });

    const stream = Readable.from(Buffer.from(await file.arrayBuffer()));
    const parser = stream.pipe(
      parse({ columns: true, trim: true, skip_empty_lines: true }),
    );

    let batch: UserDormitoryInput[] = [];
    let processedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    for await (const row of parser) {
      const parsed = UserDormitorySchema.safeParse(row);

      if (!parsed.success) {
        errors.push(`Row format error: ${JSON.stringify(row)}`);
        errorCount++;
        continue;
      }

      batch.push(parsed.data);

      if (batch.length >= BATCH_SIZE) {
        const result = await processBatchOptimized(batch);
        processedCount += result.processed;
        errorCount += result.errors.length;
        errors.push(...result.errors);
        batch = [];
      }
    }

    if (batch.length > 0) {
      const result = await processBatchOptimized(batch);
      processedCount += result.processed;
      errorCount += result.errors.length;
      errors.push(...result.errors);
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      failed: errorCount,
      errors: errors.slice(0, 50),
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

async function processBatchOptimized(rows: UserDormitoryInput[]) {
  const errors: string[] = [];

  const universityIds = rows.map((r) => r.studentId);
  const blockNames = [...new Set(rows.map((r) => r.block))];

  const users = await prisma.user.findMany({
    where: { universityId: { in: universityIds, mode: "insensitive" } },
    select: { id: true, universityId: true },
  });

  const userMap = new Map(
    users.map((u) => [u.universityId.toLowerCase(), u.id]),
  );

  const dorms = await prisma.dormitory.findMany({
    where: {
      block: { name: { in: blockNames, mode: "insensitive" } },
    },
    include: { block: true },
  });

  const dormMap = new Map(
    dorms.map((d) => [`${d.block.name}:${d.number}`, d.id]),
  );

  const validEntries = [];
  const validUserIds = [];
  const validDormIds = [];

  for (const row of rows) {
    const userId = userMap.get(row.studentId.toLowerCase());
    if (!userId) {
      errors.push(`User not found: ${row.studentId}`);
      continue;
    }

    const dormId = dormMap.get(`${row.block}:${row.dormNumber}`);
    if (!dormId) {
      errors.push(`Dorm not found: ${row.block}-${row.dormNumber}`);
      continue;
    }

    validEntries.push({
      userId,
      dormId,
      isActive: true,
      validUntil: row.validUntil,
    });

    validUserIds.push(userId);
    validDormIds.push(dormId);
  }

  if (validEntries.length === 0) return { processed: 0, errors };

  await prisma.$transaction([
    prisma.userDormitory.updateMany({
      where: {
        userId: { in: validUserIds },
        isActive: true,
      },
      data: { isActive: false },
    }),

    prisma.userDormitory.createMany({
      data: validEntries,
    }),

    prisma.dormitory.updateMany({
      where: { id: { in: validDormIds } },
      data: { status: "OCCUPIED" },
    }),
  ]);

  return { processed: validEntries.length, errors };
}
