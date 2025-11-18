import { sendMailQueue } from "../queues/sendMail.queue.js";

export const sendMail = async (req, res) => {
  const { accountId, to, subject, message, cc } = req.body;

  await sendMailQueue.add("send-email", {
    accountId,
    mail: {
      to,
      cc,
      subject,
      html: message
    }
  });

  res.json({ success: true, message: "Email is being sent" });
};
