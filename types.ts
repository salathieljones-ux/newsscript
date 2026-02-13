
export interface NewsStory {
  id: string;
  title: string;
  summary: string;
  continent: Continent;
  ideology: string;
  scripture: {
    reference: string;
    text: string;
    application: string;
  };
  sourceUrl?: string;
}

export type Continent = 'Africa' | 'Asia' | 'Europe' | 'North America' | 'South America' | 'Oceania';

export interface GroundingSource {
  title: string;
  uri: string;
}
