import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/server-auth";
import { Role } from "@/generated/prisma/enums";
import { parse, NODE_STREAM_INPUT } from "papaparse";
import { z } from "zod";
import { Readable } from "stream";

const UserDormitorySchema = z.object({
  studentId: z.string().trim(),
  block: z.string().trim(),
  dormNumber: z.coerce.number(),
  validUntil: z.preprocess(
    (val) => (val === "" || val === null ? undefined : val),
    z.coerce.date().optional(),
  ),
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

    let batch: UserDormitoryInput[] = [];
    let processedCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    const nodeStream = Readable.fromWeb(file.stream() as any);

    await new Promise<void>((resolve, reject) => {
      const papaStream = parse(NODE_STREAM_INPUT, {
        header: true,
        skipEmptyLines: "greedy",
        transform: (value) => value.trim(),
        transformHeader: (header) => header.trim(),
      });

      // 3. Setup event listeners on the papaStream
      papaStream.on("data", async (row) => {
        const parsed = UserDormitorySchema.safeParse(row);

        if (!parsed.success) {
          errors.push(`Format error: ${JSON.stringify(row)}`);
          errorCount++;
          return;
        }

        batch.push(parsed.data);

        if (batch.length >= BATCH_SIZE) {
          nodeStream.pause(); // Pause the source stream
          const result = await processBatchOptimized(batch);
          processedCount += result.processed;
          errorCount += result.errors.length;
          errors.push(...result.errors);
          batch = [];
          nodeStream.resume(); // Resume source stream
        }
      });

      papaStream.on("error", (err) => reject(err));
      papaStream.on("finish", () => resolve());

      // 4. Pipe the converted node stream into PapaParse
      nodeStream.pipe(papaStream);
    });

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

  const universityIds = rows.map((r) => r.studentId.trim().toLowerCase());
  const blockNames = [
    ...new Set(rows.map((r) => r.block.trim().toUpperCase())),
  ];

  const users = await prisma.user.findMany({
    where: { universityId: { in: universityIds } },
    select: { id: true, universityId: true },
  });

  const userMap = new Map(users.map((u) => [u.universityId, u.id]));

  const dorms = await prisma.dormitory.findMany({
    where: {
      block: { name: { in: blockNames } },
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
    const studentIdKey = row.studentId.trim().toLowerCase();
    const userId = userMap.get(studentIdKey);

    if (!userId) {
      errors.push(`User not found: ${row.studentId}`);
      continue;
    }

    const dormKey = `${row.block.trim().toUpperCase()}:${row.dormNumber}`;
    const dormId = dormMap.get(dormKey);

    if (!dormId) {
      errors.push(
        `Dorm not found: Block "${row.block}" Number ${row.dormNumber}`,
      );
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
