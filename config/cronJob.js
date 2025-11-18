import cron from "node-cron";
import EmailAccount from "../model/EmailAccount.js";
import { syncMailQueue } from "../queues/syncMail.queue.js";

cron.schedule("* * * * *", async () => {
  const accounts = await EmailAccount.find();
  accounts.forEach(acc => {
    syncMailQueue.add("sync", { accountId: acc._id });
  });
});
