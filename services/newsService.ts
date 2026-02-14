
import { GoogleGenAI } from "@google/genai";
import { Continent, NewsStory, GroundingSource } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export async function fetchTrendingNews(continent: Continent): Promise<{ stories: NewsStory[], sources: GroundingSource[] }> {
  const model = 'gemini-3-flash-preview';
  
  const prompt = `
    Find the top 10 trending news stories from the continent of ${continent} today.
    For each story, perform the following:
    1. Summarize the story in 2-3 sentences.
    2. Identify the core "underlying ideology" or moral theme (e.g., greed, justice, compassion, stewardship, pride).
    3. Find a specific Bible scripture (Reference and Text) that speaks directly to this ideology or provides wisdom for this situation.
    4. Explain briefly why this scripture is applicable.
    
    IMPORTANT: Provide the output as a valid JSON array of objects.
    Each object MUST have these fields: "title", "summary", "ideology", "scripture_ref", "scripture_text", "application".
    
    Even if you use Google Search grounding, attempt to format your text response clearly so I can parse the JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        // Note: responseMimeType: "application/json" is not used with googleSearch per guidelines
      },
    });

    const text = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources: GroundingSource[] = groundingChunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title || 'Source',
        uri: chunk.web.uri
      }));

    // Extract JSON from text (sometimes Gemini wraps it in ```json ... ```)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("Failed to parse news data");
    }

    const rawStories = JSON.parse(jsonMatch[0]);

    const stories: NewsStory[] = rawStories.map((s: any, index: number) => ({
      id: `${continent}-${index}`,
      title: s.title,
      summary: s.summary,
      continent: continent,
      ideology: s.ideology,
      scripture: {
        reference: s.scripture_ref,
        text: s.scripture_text,
        application: s.application
      },
      // Try to match a source if possible, or just provide the first few relevant ones
      sourceUrl: sources[index]?.uri || (sources.length > 0 ? sources[0].uri : undefined)
    }));

    return { stories, sources };
  } catch (error) {
    console.error("Error fetching news:", error);
    throw error;
  }
}
