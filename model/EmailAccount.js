import mongoose from "mongoose";

const EmailAccountSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true }, // app user id (hr, lawyer, etc.)
    email: { type: String, required: true },
    provider: { type: String }, // gmail, outlook, custom, etc.
    smtp: {
      host: String,
      port: Number,
      secure: Boolean,
      username: String,
      password: String, // in production encrypt this!
    },
    imap: {
      host: String,
      port: Number,
      secure: Boolean,
      username: String,
      password: String, // in production encrypt this!
    },
    lastSyncedUID: { type: Number, default: 0 },
    lastSync: { type: Date },
  },
  { timestamps: true }
);

const EmailAccount = mongoose.model("EmailAccount", EmailAccountSchema);

export default EmailAccount;
