export default function handler(req, res) {
  const key = process.env.GEMINI_API_KEY;
  const hasKey = Boolean(key && key.length > 10);

  res.status(200).json({
    hasGEMINI_API_KEY: hasKey,
    keyLength: key ? key.length : 0,
    note: "This does not print the key, only whether it exists."
  });
}
