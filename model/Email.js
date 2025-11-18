import mongoose from "mongoose";

const AttachmentSchema = new mongoose.Schema(
  {
    fileName: String,
    size: Number,
    mimeType: String,
    url: String, // S3 or local path
  },
  { _id: false }
);

const EmailSchema = new mongoose.Schema(
  {
    accountId: { type: mongoose.Schema.Types.ObjectId, ref: "EmailAccount", required: true },
    messageId: String,
    threadId: String,
    folder: { type: String, default: "inbox" }, // inbox, sent, drafts, etc.
    from: [{ name: String, email: String }],
    to: [{ name: String, email: String }],
    cc: [{ name: String, email: String }],
    bcc: [{ name: String, email: String }],
    subject: String,
    text: String,
    html: String,
    date: Date,
    flags: [String],
    attachments: [AttachmentSchema],
  },
  { timestamps: true }
);

const Email = mongoose.model("Email", EmailSchema);
export default Email;
