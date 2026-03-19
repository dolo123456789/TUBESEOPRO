import React, { useState, useEffect } from 'react';
import { TrendingUp, Flame, Play, Eye, Loader2, Crown } from 'lucide-react';
import { useSearchContext } from '../context/SearchContext';
import { fetchTrendingVideos } from '../services/geminiService';
import { useProMode } from '../context/ProModeContext';

export function TrendingVideosView() {
  const { isPro } = useProMode();
  const { lastKeyword } = useSearchContext();
  const [trendingVideos, setTrendingVideos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [activeRegion, setActiveRegion] = useState('Global');

  const categories = ['All', 'Gaming', 'Music', 'Education', 'Entertainment', 'Tech', 'News'];
  const regions = ['Global', 'USA', 'France', 'Senegal', 'India', 'UK', 'Brazil'];

  useEffect(() => {
    const loadTrending = async () => {
      setIsLoading(true);
      try {
        const data = await fetchTrendingVideos(lastKeyword || 'YouTube', activeCategory, activeRegion);
        setTrendingVideos(data);
      } catch (error) {
        console.error('Failed to fetch trending videos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTrending();
  }, [lastKeyword, activeCategory, activeRegion]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            Vidéos Tendances pour "{lastKeyword || 'YouTube'}"
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Découvrez ce qui devient viral en ce moment sur YouTube.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white dark:bg-[#1a1b20] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Catégorie :</span>
            <select 
              value={activeCategory}
              onChange={(e) => setActiveCategory(e.target.value)}
              className="bg-transparent border-0 text-sm font-bold text-slate-900 dark:text-white focus:ring-0 cursor-pointer outline-none"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          
          <div className="flex items-center gap-2 bg-white dark:bg-[#1a1b20] border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-1.5">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Région :</span>
            <select 
              value={activeRegion}
              onChange={(e) => setActiveRegion(e.target.value)}
              className="bg-transparent border-0 text-sm font-bold text-slate-900 dark:text-white focus:ring-0 cursor-pointer outline-none"
            >
              {regions.map(reg => <option key={reg} value={reg}>{reg}</option>)}
            </select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        </div>
      ) : (
        <div className="relative min-h-[400px]">
          <div className={`grid gap-6 md:grid-cols-2 xl:grid-cols-3 transition-all duration-700 ${!isPro ? 'blur-xl opacity-30 select-none pointer-events-none' : ''}`}>
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
                  {video.viral_score && (
                    <div className="absolute bottom-3 left-3 bg-indigo-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md shadow-lg">
                      VIRAL : {video.viral_score}%
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {video.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{video.channel}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                      <Eye className="h-4 w-4 text-slate-400 dark:text-slate-500" />
                      {video.views} vues
                    </div>
                    <a 
                      href={video.video_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                    >
                      Regarder
                    </a>
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

          {!isPro && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-white/10 dark:bg-black/10 backdrop-blur-[1px]">
              <div className="bg-white dark:bg-[#1a1b20] p-10 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 text-center max-w-lg transform animate-in fade-in zoom-in duration-700">
                <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-500/40 rotate-6">
                  <Flame className="h-10 w-10 text-white animate-pulse" />
                </div>
                <h4 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tighter">TENDANCES EXCLUSIVES</h4>
                <p className="text-slate-500 dark:text-slate-400 mb-10 text-lg leading-relaxed">
                  Découvrez les vidéos qui explosent en temps réel. Cette fonctionnalité est réservée aux membres <b>Pro</b>.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-indigo-500/30 transition-all"
                  >
                    Essayer TubeSEO Pro
                  </button>
                  <button className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold py-4 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                    En savoir plus
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
