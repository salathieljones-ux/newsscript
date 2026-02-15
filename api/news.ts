

export default async function handler(req: any, res: any) {
  // CORS: allow your GitHub Pages origin
  res.setHeader("Access-Control-Allow-Origin", "https://salathieljones-ux.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const continent = String(req.query.continent || "Oceania");
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return res.status(500).json({ error: "Missing GEMINI_API_KEY on server" });

  const model = "gemini-3-flash-preview";

  const prompt = `
Find the top 10 trending news stories from the continent of ${continent} today.
For each story:
1) Summarize in 2-3 sentences.
2) Identify the underlying ideology or moral theme.
3) Provide a specific Bible scripture (reference and text) that speaks to it.
4) Briefly explain why it applies.

Return ONLY valid JSON array of objects with:
"title","summary","ideology","scripture_ref","scripture_text","application".
`;

  try {
    const endpoint =
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=` +
      encodeURIComponent(apiKey);

    const geminiResp = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.6 },
        tools: [{ googleSearch: {} }],
      }),
    });

    const data = await geminiResp.json();

    if (!geminiResp.ok) {
      return res.status(geminiResp.status).json({ error: "Gemini error", details: data });
    }

    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    // Extract JSON array from text (in case it wraps it)
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return res.status(500).json({ error: "Gemini returned non-JSON", raw: text });

    const rawStories = JSON.parse(match[0]);

    // Return in the shape your frontend expects
    return res.status(200).json({
      stories: rawStories.map((s: any, idx: number) => ({
        id: `${continent}-${idx}`,
        title: s.title,
        summary: s.summary,
        continent,
        ideology: s.ideology,
        scripture: {
          reference: s.scripture_ref,
          text: s.scripture_text,
          application: s.application,
        },
        sourceUrl: undefined,
      })),
      sources: [],
    });
  } catch (e: any) {
    return res.status(500).json({ error: "Server exception", message: String(e?.message || e) });
  }
}
