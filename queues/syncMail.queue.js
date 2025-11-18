import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";
export const syncMailQueue = new Queue("syncMail", {
  connection: redisConnection
});
