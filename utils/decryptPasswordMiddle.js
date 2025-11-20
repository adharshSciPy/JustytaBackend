import crypto from "crypto";

export const decryptPassword = (encryptedText) => {
  if (!encryptedText) return null;

  const iv = Buffer.from(process.env.IV, "hex");
  const key = Buffer.from(process.env.ENCRYPTION_KEY, "hex");

  const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);
  let decrypted = decipher.update(encryptedText, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
};
