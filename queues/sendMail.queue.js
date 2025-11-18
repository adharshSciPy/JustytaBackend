import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";

export const sendMailQueue = new Queue("sendMail", {
  connection: redisConnection
});
