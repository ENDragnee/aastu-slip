import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getApiSession } from "@/lib/server-auth";
import { Role } from "@/generated/prisma/enums";
import { parse, NODE_STREAM_INPUT } from "papaparse";
import { z } from "zod";
import { Readable } from "stream";
import { createId } from "@paralleldrive/cuid2";

const BlockSchema = z.object({
  name: z.string().trim().toUpperCase(),
  locationId: z.string().trim().optional(),
});

type BlockSchemaInput = z.infer<typeof BlockSchema>;

const BATCH_SIZE = 100;

export async function POST(request: NextRequest) {
  try {
    const session = await getApiSession();

    if (!session || !session.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized you have to login!" },
        { status: 401 },
      );
    }

    if (session.user.role !== Role.ADMIN) {
      return NextResponse.json(
        { error: "User is not authorized to use the api, Admin only!" },
        { status: 403 },
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file)
      return NextResponse.json(
        { error: "File is empty or invalid" },
        { status: 400 },
      );

    let batch: BlockSchemaInput[] = [];
    let processedCount = 0;
    let errorCount = 0;

    let errors: string[] = [];

    let activeWork: Promise<any> = Promise.resolve();

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
        const parsed = BlockSchema.safeParse(row);

        if (!parsed.success) {
          errors.push(`Format error: ${JSON.stringify(row)}`);
          errorCount++;
          return;
        }

        batch.push(parsed.data);

        if (batch.length >= BATCH_SIZE) {
          nodeStream.pause(); // Pause the source stream
          const currentBatch = [...batch];
          batch = [];

          // Chain the promise to ensure sequential processing
          activeWork = activeWork
            .then(async () => {
              const result = await processBatchOptimized(currentBatch);
              processedCount += result.processed;
              errorCount += result.errors.length;
              errors.push(...result.errors);
              nodeStream.resume();
            })
            .catch(reject);
        }
      });

      papaStream.on("error", (err) => reject(err));
      papaStream.on("finish", () => {
        activeWork.then(() => resolve());
      });

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
    console.log(`Unexpected error: ${err}`);
    return NextResponse.json(
      { error: "Unexpected error has occured!" },
      { status: 500 },
    );
  }
}

async function processBatchOptimized(rows: BlockSchemaInput[]) {
  const errors: string[] = [];
  let processed = 0;
  try {
    const blocksToInsert = rows.map((r) => ({
      id: createId(),
      name: r.name,
      locationId: r.locationId || null,
    }));

    const result = await prisma.block.createMany({
      data: blocksToInsert,
      skipDuplicates: true,
    });

    processed = result.count;
  } catch (err: any) {
    errors.push(`Batch failed: ${err.message}`);
  }

  return { processed, errors };
}
