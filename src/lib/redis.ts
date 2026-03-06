import IORedis, { RedisOptions } from "ioredis";

export const redisOptions: RedisOptions = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT || "6379"),
  maxRetriesPerRequest: null,
};

const connection = new IORedis(redisOptions);

export default connection;
