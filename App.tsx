
import React, { useState, useEffect, useCallback } from 'react';
import { Continent, NewsStory } from './types';
import { fetchTrendingNews } from './services/newsService';
import { NewsCard } from './components/NewsCard';

const CONTINENTS: Continent[] = ['Africa', 'Asia', 'Europe', 'North America', 'South America', 'Oceania'];

interface CachedNews {
  stories: NewsStory[];
  lastUpdated: Date;
}

const App: React.FC = () => {
  const [activeContinent, setActiveContinent] = useState<Continent>('Africa');
  const [news, setNews] = useState<Record<string, CachedNews>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadNews = useCallback(async (continent: Continent, forceRefresh = false) => {
    // If not forcing refresh and we have data, use the cache
    if (!forceRefresh && news[continent]) return;

    setLoading(true);
    setError(null);
    try {
      const data = await fetchTrendingNews(continent);
      setNews(prev => ({ 
        ...prev, 
        [continent]: { 
          stories: data.stories, 
          lastUpdated: new Date() 
        } 
      }));
    } catch (err) {
      setError(`Failed to load news for ${continent}. Please try again.`);
    } finally {
      setLoading(false);
    }
  }, [news]);

  useEffect(() => {
    loadNews(activeContinent);
  }, [activeContinent, loadNews]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 gradient-bg text-white shadow-lg pt-6 pb-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-indigo-500 rounded-full flex items-center justify-center shadow-inner">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">NewsScript</h1>
                <p className="text-[10px] text-indigo-300 uppercase tracking-widest font-semibold">Global Biblical Perspective</p>
              </div>
            </div>

            <button 
              onClick={() => loadNews(activeContinent, true)}
              disabled={loading}
              className={`p-2 rounded-full hover:bg-white/10 transition-colors ${loading ? 'animate-spin opacity-50' : ''}`}
              title="Refresh News"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          {/* Continent Tabs */}
          <nav className="flex overflow-x-auto pb-2 no-scrollbar space-x-1">
            {CONTINENTS.map((continent) => (
              <button
                key={continent}
                onClick={() => setActiveContinent(continent)}
                className={`flex-none px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  activeContinent === continent 
                    ? 'bg-white text-slate-900 shadow-sm' 
                    : 'text-indigo-200 hover:text-white hover:bg-white/10'
                }`}
              >
                {continent}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow container mx-auto px-4 py-8 max-w-2xl">
        {loading && !news[activeContinent] ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium animate-pulse">Searching global headlines for {activeContinent}...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
            <p className="text-red-600 font-medium mb-4">{error}</p>
            <button 
              onClick={() => loadNews(activeContinent, true)}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mb-8 flex justify-between items-end">
              <div>
                <h2 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">
                  Trending in {activeContinent}
                </h2>
                {news[activeContinent] && (
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    Last updated: {formatTime(news[activeContinent].lastUpdated)}
                  </p>
                )}
              </div>
              {loading && (
                <span className="text-xs text-indigo-500 font-semibold animate-pulse">Updating...</span>
              )}
            </div>
            
            {news[activeContinent]?.stories.map((story) => (
              <NewsCard key={story.id} story={story} />
            ))}

            {!loading && news[activeContinent]?.stories.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <p className="text-slate-400">No stories found for this region.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Mobile-friendly Footer */}
      <footer className="bg-white border-t border-slate-200 py-8 text-center mt-auto">
        <div className="container mx-auto px-4">
          <p className="text-xs text-slate-400 mb-2">
            AI-curated news and scripture pairings. Powered by Gemini.
          </p>
          <p className="text-[10px] text-slate-300 italic">
            "Thy word is a lamp unto my feet, and a light unto my path." — Psalm 119:105
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
