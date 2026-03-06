import { Queue } from "bullmq";
import { redisOptions } from "./redis";

export const emailQueue = new Queue("email-queue", {
  connection: redisOptions,
});
