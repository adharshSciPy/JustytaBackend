import { Worker } from "bullmq";
import EmailAccount from "../models/EmailAccount.js";
import { redisConnection } from "../config/redis.js";
import { syncIMAP } from "../services/imapReceiver.js";

const worker = new Worker(
  "syncMail",
  async (job) => {
    const { accountId } = job.data;
    const account = await EmailAccount.findById(accountId);
    if (!account) {
      throw new Error("Email account not found");
    }
    await syncIMAP(account);
    return { success: true };
  },
  {
    connection: redisConnection,
  }
);

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job.id} failed in syncMail queue:`, err.message);
});

console.log("🚀 syncMail worker started");

