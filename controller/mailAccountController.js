import EmailAccount from "../model/EmailAccount.js";

export const createEmailAccount = async (req, res) => {
  try {
    const { userId, email, provider, smtp, imap } = req.body;

    const account = await EmailAccount.create({
      userId,
      email,
      provider,
      smtp,
      imap,
    });

    res.status(201).json({ success: true, data: account });
  } catch (err) {
    console.error("createEmailAccount error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const listEmailAccounts = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const accounts = await EmailAccount.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: accounts });
  } catch (err) {
    console.error("listEmailAccounts error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};