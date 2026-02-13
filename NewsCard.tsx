
import React from 'react';
import { NewsStory } from '../types';

interface NewsCardProps {
  story: NewsStory;
}

export const NewsCard: React.FC<NewsCardProps> = ({ story }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded uppercase tracking-wider">
            {story.continent}
          </span>
          {story.sourceUrl && (
            <a 
              href={story.sourceUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center"
            >
              View Source
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">
          {story.title}
        </h3>
        
        <p className="text-slate-600 text-sm mb-4 leading-relaxed">
          {story.summary}
        </p>

        <div className="bg-slate-50 border-l-4 border-indigo-500 p-4 rounded-r-lg">
          <div className="flex items-center mb-2">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200 mr-2">
              Ideology
            </span>
            <span className="text-sm font-semibold text-slate-800">{story.ideology}</span>
          </div>
          
          <div className="mt-4">
            <p className="font-serif italic text-lg text-slate-800 leading-relaxed mb-2">
              &ldquo;{story.scripture.text}&rdquo;
            </p>
            <p className="text-sm font-bold text-slate-900 text-right">
              — {story.scripture.reference}
            </p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-xs text-slate-500 italic">
              <span className="font-bold text-slate-700 not-italic">Perspective: </span>
              {story.scripture.application}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
