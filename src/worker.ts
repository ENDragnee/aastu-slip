import "dotenv/config"; // ✅ LOAD .ENV FIRST
import { Worker } from "bullmq";
import { redisOptions } from "@/lib/redis";
import { sendOnboardingEmail } from "@/lib/email";

console.log("Worker started...");

const worker = new Worker(
  "email-queue",
  async (job) => {
    console.log(`Processing job ${job.id} for ${job.data.email}`);

    try {
      await sendOnboardingEmail(job.data.email, job.data.name, job.data.token);
      console.log(`Email sent to ${job.data.email}`);
    } catch (error) {
      console.error(`Failed to send email to ${job.data.email}`, error);
      throw error;
    }
  },
  {
    connection: redisOptions,
  },
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.log(`Job ${job?.id} failed: ${err.message}`);
});

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("Closing worker...");
  await worker.close();
  process.exit(0);
});
