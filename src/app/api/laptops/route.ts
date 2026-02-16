import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma/enums";
import { getApiSession } from "@/lib/server-auth";
import { z } from "zod";
import { parse, NODE_STREAM_INPUT } from "papaparse";
import { Readable } from "stream";

const LaptopSchema = z.object({
  studentId: z.string().trim(),
  serialNumber: z.string().trim(),
  model: z.string().trim(),
  manufacturer: z.string().trim(),
});

type LaptopInput = z.infer<typeof LaptopSchema>;

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

    let batch: LaptopInput[] = [];
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
        const parsed = LaptopSchema.safeParse(row);

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
    console.error("Unexpected error: ", err);
    return NextResponse.json({ error: "Unexpected error!" }, { status: 500 });
  }
}

async function processBatchOptimized(rows: LaptopInput[]) {
  const errors: string[] = [];

  const universityIds = rows.map((r) => r.studentId.trim().toLowerCase());

  const users = await prisma.user.findMany({
    where: { universityId: { in: universityIds } },
    select: { id: true, universityId: true },
  });

  const userMap = new Map(
    users.map((u) => [u.universityId, u.id]),
  );

  const validEntries = [];
  const validUserIds = [];

  for (const row of rows) {
    const userId = userMap.get(row.studentId.trim().toLowerCase());
    const manufacturer = row.manufacturer.trim().toUpperCase();
    const model = row.model.trim().toUpperCase();
    const serialNumber = row.serialNumber.trim().toUpperCase();

    if (!userId) {
      errors.push(`User not found: ${row.studentId}`);
      continue;
    }

    validEntries.push({
      userId,
      manufacturer,
      model,
      serialNumber,
    });

    validUserIds.push(userId);
  }

  if (validEntries.length === 0) return { processed: 0, errors };

  await prisma.laptop.createMany({
    data: validEntries,
    skipDuplicates: true,
  });

  return { processed: validEntries.length, errors };
}
