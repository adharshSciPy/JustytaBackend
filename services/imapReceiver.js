import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";
import Email from "../models/Email.js";

export const syncIMAP = async (account) => {
  const client = new ImapFlow({
    host: account.imap.host,
    port: account.imap.port,
    secure: account.imap.secure,
    auth: {
      user: account.imap.username,
      pass: account.imap.password,
    },
  });

  console.log(`🔄 Connecting IMAP for ${account.email}`);

  await client.connect();

  let lock = await client.getMailboxLock("INBOX");

  try {
    const fromUid = (account.lastSyncedUID || 0) + 1;
    const range = `${fromUid}:*`;

    console.log(`📥 Syncing mails for ${account.email} from UID ${fromUid}`);

    for await (let msg of client.fetch(range, { envelope: true, source: true, uid: true, flags: true })) {
      const parsed = await simpleParser(msg.source);

      const emailDoc = new Email({
        accountId: account._id,
        messageId: parsed.messageId,
        threadId: parsed.references ? parsed.references[0] : null,
        folder: "inbox",
        from: parsed.from ? parsed.from.value : [],
        to: parsed.to ? parsed.to.value : [],
        cc: parsed.cc ? parsed.cc.value : [],
        bcc: parsed.bcc ? parsed.bcc.value : [],
        subject: parsed.subject,
        text: parsed.text,
        html: parsed.html,
        date: parsed.date || new Date(),
        flags: Array.from(msg.flags || []),
        attachments: (parsed.attachments || []).map((att) => ({
          fileName: att.filename,
          size: att.size,
          mimeType: att.contentType,
          url: "", // TODO: upload to S3 or file storage
        })),
      });

      await emailDoc.save();

      // update last synced UID
      account.lastSyncedUID = msg.uid;
      account.lastSync = new Date();
      await account.save();
    }

    console.log(`✅ Sync finished for ${account.email}`);
  } catch (err) {
    console.error(`❌ IMAP sync error for ${account.email}:`, err.message);
  } finally {
    lock.release();
    await client.logout();
  }
};
