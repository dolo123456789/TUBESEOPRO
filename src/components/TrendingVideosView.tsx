import React, { useState, useEffect } from 'react';
import { TrendingUp, Flame, Play, Eye, Loader2 } from 'lucide-react';
import { useSearchContext } from '../context/SearchContext';
import { fetchTrendingVideos } from '../services/geminiService';

export function TrendingVideosView() {
  const { lastKeyword } = useSearchContext();
  const [trendingVideos, setTrendingVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadTrending = async () => {
      setIsLoading(true);
      try {
        const data = await fetchTrendingVideos(lastKeyword || 'YouTube');
        setTrendingVideos(data);
      } catch (error) {
        console.error('Failed to fetch trending videos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTrending();
  }, [lastKeyword]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            Trending Videos for "{lastKeyword || 'YouTube'}"
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Discover what's going viral right now across YouTube.</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {trendingVideos.map((video, i) => (
            <div key={i} className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b20] overflow-hidden shadow-sm hover:shadow-md transition-all">
              <div className="relative aspect-video overflow-hidden bg-slate-100 dark:bg-[#0f1115]">
                <img 
                  src={video.thumbnail} 
                  alt={video.title}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="h-12 w-12 rounded-full bg-white/90 dark:bg-black/90 flex items-center justify-center backdrop-blur-sm">
                    <Play className="h-5 w-5 text-slate-900 dark:text-white ml-1" />
                  </div>
                </div>
                <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                  {video.growth}
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {video.title}
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{video.channel}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                    <Eye className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                    {video.views} views
                  </div>
                  <button className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
                    Analyze
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {video.tags.map((tag: string, i: number) => (
                    <span key={i} className="inline-flex items-center rounded-md bg-slate-100 dark:bg-[#0f1115] px-2 py-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
