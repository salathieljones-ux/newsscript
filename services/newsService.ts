import { Continent, NewsStory, GroundingSource } from "../types";

export async function fetchTrendingNews(
  continent: Continent
): Promise<{ stories: NewsStory[]; sources: GroundingSource[] }> {
  const resp = await fetch(
    `/api/news?continent=${encodeURIComponent(continent)}`,
    { method: "GET" }
  );

  if (!resp.ok) {
    const errText = await resp.text().catch(() => "");
    throw new Error(`Backend error ${resp.status}: ${errText}`);
  }

  return resp.json();
}

