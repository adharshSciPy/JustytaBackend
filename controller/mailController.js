import { sendMailQueue } from "../queues/sendMail.queue.js";

export const sendMail = async (req, res) => {
  try {
    const { accountId, to, subject, message, cc } = req.body;

    // Validate request
    if (!accountId) {
      return res.status(400).json({
        success: false,
        message: "accountId is required"
      });
    }
    if (!to) {
      return res.status(400).json({
        success: false,
        message: "Recipient email (to) is required"
      });
    }
    if (!subject) {
      return res.status(400).json({
        success: false,
        message: "Subject is required"
      });
    }

    // Add job to BullMQ queue
    await sendMailQueue.add("send-email", {
      accountId,
      mail: {
        to,
        cc,
        subject,
        html: message
      }
    });

    return res.status(200).json({
      success: true,
      message: "Email queued for sending"
    });

  } catch (error) {
    console.error("❌ sendMail Error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to queue email",
      error: error.message
    });
  }
};