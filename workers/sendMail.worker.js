import { Worker } from "bullmq";
import nodemailer from "nodemailer";
import { redisConnection } from "../config/redis.js";
import EmailAccount from "../models/EmailAccount.js";
import Email from "../model/Email.js";

const worker = new Worker(
  "sendMail",
  async (job) => {
    const { accountId, mail } = job.data;
    const account = await EmailAccount.findById(accountId);
    if (!account) {
      throw new Error("Email account not found");
    }

    const transporter = nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.smtp.username,
        pass: account.smtp.password,
      },
    });

    console.log(`📤 Sending email from ${account.email} to ${mail.to}`);

    const info = await transporter.sendMail({
      from: account.email,
      to: mail.to,
      cc: mail.cc,
      bcc: mail.bcc,
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      attachments: mail.attachments,
    });

    // Save to DB as sent mail
    await Email.create({
      accountId: account._id,
      messageId: info.messageId,
      folder: "sent",
      from: [{ name: "", email: account.email }],
      to: Array.isArray(mail.to)
        ? mail.to.map((e) => ({ email: e }))
        : [{ email: mail.to }],
      cc: [],
      bcc: [],
      subject: mail.subject,
      text: mail.text,
      html: mail.html,
      date: new Date(),
      flags: [],
      attachments: (mail.attachments || []).map((att) => ({
        fileName: att.filename,
        size: att.size,
        mimeType: att.contentType || att.mimetype,
        url: "", // TODO: upload to S3
      })),
    });

    console.log(`✅ Email sent: ${info.messageId}`);
    return info;
  },
  {
    connection: redisConnection,
  }
);

worker.on("failed", (job, err) => {
  console.error(`❌ Job ${job.id} failed in sendMail queue:`, err.message);
});

console.log("🚀 sendMail worker started");
