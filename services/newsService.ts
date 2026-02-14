import { Continent, NewsStory, GroundingSource } from "../types";

// TODO: Replace this with your actual backend URL (Vercel/Netlify/etc.)
const BACKEND_BASE_URL = "https://YOUR-BACKEND-DOMAIN";

export async function fetchTrendingNews(
  continent: Continent
): Promise<{ stories: NewsStory[]; sources: GroundingSource[] }> {
  const resp = await fetch(
    `${BACKEND_BASE_URL}/api/news?continent=${encodeURIComponent(continent)}`,
    { method: "GET" }
  );

  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    throw new Error(`Backend error ${resp.status}: ${errText}`);
  }

  // Expecting the backend to return:
  // { stories: NewsStory[], sources: GroundingSource[] }
  return resp.json();
}
