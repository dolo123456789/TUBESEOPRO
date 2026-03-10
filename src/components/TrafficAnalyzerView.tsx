import React, { useState } from 'react';
import { BarChart3, Loader2, Search, TrendingUp, Users, Clock, Sparkles, Youtube, Crown } from 'lucide-react';
import { analyzeTrafficSources, fetchChannelTopVideos, generateGrowthStrategy } from '../services/geminiService';
import { useProMode } from '../context/ProModeContext';

export function TrafficAnalyzerView() {
  const { isPro } = useProMode();
  const [channelName, setChannelName] = useState('');
  const [analysis, setAnalysis] = useState<any>(null);
  const [topVideos, setTopVideos] = useState<any[]>([]);
  const [strategy, setStrategy] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('traffic_history');
    return saved ? JSON.parse(saved) : [];
  });

  const saveToHistory = (name: string) => {
    const newHistory = [name, ...history.filter(h => h !== name)].slice(0, 5);
    setHistory(newHistory);
    localStorage.setItem('traffic_history', JSON.stringify(newHistory));
  };

  const handleAnalyze = async (name: string = channelName) => {
    if (!name) return;
    setChannelName(name);
    setIsLoading(true);
    setError(null);
    setAnalysis(null);
    setTopVideos([]);
    setStrategy(null);
    try {
      const [analysisData, topVideosData] = await Promise.all([
        analyzeTrafficSources(name),
        fetchChannelTopVideos(name)
      ]);
      
      if (!analysisData || Object.keys(analysisData).length === 0) {
        throw new Error("Impossible de récupérer les données d'analyse. Veuillez vérifier le nom de la chaîne.");
      }
      
      setAnalysis(analysisData);
      setTopVideos(topVideosData);
      saveToHistory(name);
      
      const strategyData = await generateGrowthStrategy(name, analysisData);
      setStrategy(strategyData);
    } catch (err: any) {
      console.error('Failed to analyze traffic:', err);
      setError(err.message || "Une erreur s'est produite lors de l'analyse.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-[#1a1b20] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-indigo-500" />
          Traffic Analyzer & Growth Strategy
        </h1>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="Enter YouTube Channel Name"
            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            onClick={() => handleAnalyze()}
            disabled={isLoading || !channelName}
            className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            Analyze
          </button>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">Recent:</span>
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => handleAnalyze(h)}
                className="text-xs bg-slate-100 dark:bg-[#0f1115] hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-1 rounded-md transition-colors whitespace-nowrap"
              >
                {h}
              </button>
            ))}
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex flex-col justify-center items-center py-12 space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
          <p className="text-sm text-slate-500 animate-pulse">L'IA analyse les sources de trafic réelles...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200 dark:border-red-800 text-red-800 dark:text-red-400 text-sm flex items-center gap-3">
          <TrendingUp className="h-5 w-5 rotate-180" />
          {error}
        </div>
      )}

      {analysis && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="bg-white dark:bg-[#1a1b20] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Traffic Sources
            </h2>
            <div className="space-y-3">
              {analysis.traffic_sources?.map((s: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{s.source}</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">{s.percentage}%</span>
                </div>
              ))}
              {(!analysis.traffic_sources || analysis.traffic_sources.length === 0) && (
                <p className="text-sm text-slate-500 italic">No traffic source data available.</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1b20] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Demographics
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">Top Countries: {analysis.demographics?.top_countries?.join(', ')}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Age Groups: {analysis.demographics?.age_groups?.join(', ')}</p>
          </div>

          <div className="bg-white dark:bg-[#1a1b20] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm md:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              Engagement Metrics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-[#0f1115] p-4 rounded-xl">
                <p className="text-xs text-slate-500">Avg View Duration</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{analysis.engagement_metrics?.avg_view_duration}</p>
              </div>
              <div className="bg-slate-50 dark:bg-[#0f1115] p-4 rounded-xl">
                <p className="text-xs text-slate-500">Audience Retention</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{analysis.engagement_metrics?.audience_retention}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1b20] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm md:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recommendations</h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-slate-600 dark:text-slate-400">
              {analysis.recommendations?.map((r: string, i: number) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          </div>

          {/* Top Videos */}
          <div className="bg-white dark:bg-[#1a1b20] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm md:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Youtube className="h-5 w-5 text-red-500" />
              Top 5 Videos
            </h2>
            <div className="space-y-3">
              {topVideos.map((v, i) => (
                <a 
                  key={i} 
                  href={v.url?.startsWith('http') ? v.url : `https://www.youtube.com/results?search_query=${encodeURIComponent(v.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex justify-between items-center p-3 bg-slate-50 dark:bg-[#0f1115] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{v.title}</span>
                  <span className="text-sm text-slate-500">{v.views}</span>
                </a>
              ))}
              {topVideos.length === 0 && (
                <p className="text-sm text-slate-500 italic">No top videos found.</p>
              )}
            </div>
          </div>

          {/* Magic Strategy */}
          {strategy && (
            <div className="relative overflow-hidden rounded-2xl md:col-span-2">
              <div className={`bg-gradient-to-br from-indigo-600 to-purple-700 p-6 border border-indigo-500 shadow-lg text-white transition-all duration-700 ${!isPro ? 'blur-xl opacity-40 select-none pointer-events-none' : ''}`}>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-yellow-300" />
                  Stratégie "Magique" de Croissance
                </h2>
                <p className="text-indigo-100 mb-6">{strategy.strategy_summary}</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3">Plan de contenu (30 jours)</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-indigo-100">
                      {strategy.content_plan?.map((p: string, i: number) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-3">Tactiques non conventionnelles</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm text-indigo-100">
                      {strategy.unconventional_tactics?.map((t: string, i: number) => <li key={i}>{t}</li>)}
                    </ul>
                  </div>
                </div>
              </div>

              {!isPro && (
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center p-6 bg-black/20 backdrop-blur-[2px]">
                  <div className="bg-white dark:bg-[#1a1b20] p-8 rounded-3xl shadow-2xl border border-white/10 text-center max-w-md transform animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-6 rotate-3 shadow-lg">
                      <Crown className="h-8 w-8 text-white" />
                    </div>
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">DÉBLOQUEZ LA MAGIE</h4>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                      Notre IA de pointe a généré une stratégie personnalisée pour <b>{channelName}</b>. 
                      Passez au mode Pro pour voir le plan complet de 30 jours.
                    </p>
                    <button 
                      onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      PASSER À PRO MAINTENANT
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
