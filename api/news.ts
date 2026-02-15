// 4-hour cache per continent (best-effort in serverless)
// Note: Vercel instances can recycle, so we ALSO set CDN cache headers below.
type CachedValue = { ts: number; payload: any };
const CACHE = new Map<string, CachedValue>();
const TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

function setCachingHeaders(res: any) {
  // Cache at the edge (Vercel CDN) for 4 hours.
  // stale-while-revalidate helps smooth spikes and reduces Gemini calls.
  res.setHeader("Cache-Control", "public, s-maxage=14400, stale-while-revalidate=3600");
}

export default async function handler(req: any, res: any) {
  // CORS: allow your GitHub Pages origin
  res.setHeader("Access-Control-Allow-Origin", "https://salathieljones-ux.github.io");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const continent = String(req.query.continent || "Oceania");

  // --- Serve cache if fresh ---
  const cacheKey = `continent:${continent.toLowerCase()}`;
  const cached = CACHE.get(cacheKey);
  if (cached && Date.now() - cached.ts < TTL_MS) {
    setCachingHeaders(res);
    // Helpful debugging flag (optional)
    res.setHeader("X-NewsScript-Cache", "HIT");
    return res.status(200).json(cached.payload);
  }

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
      // Don’t cache errors.
      return res.status(geminiResp.status).json({ error: "Gemini error", details: data });
    }

    const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || "[]";

    // Extract JSON array from text (in case it wraps it)
    const match = text.match(/\[[\s\S]*\]/);
    if (!match) return res.status(500).json({ error: "Gemini returned non-JSON", raw: text });

    const rawStories = JSON.parse(match[0]);

    const payload = {
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
    };

    // Save best-effort in-memory cache
    CACHE.set(cacheKey, { ts: Date.now(), payload });

    // Set CDN caching headers
    setCachingHeaders(res);
    res.setHeader("X-NewsScript-Cache", "MISS");

    return res.status(200).json(payload);
  } catch (e: any) {
    return res.status(500).json({ error: "Server exception", message: String(e?.message || e) });
  }
}
