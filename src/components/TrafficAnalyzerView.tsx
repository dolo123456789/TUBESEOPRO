import React, { useState } from 'react';
import { BarChart3, Loader2, Search, TrendingUp, Users, Clock, Sparkles, Youtube, Crown, DollarSign, Activity, Globe, Eye, Target, Zap, Rocket, CheckCircle2, RefreshCw } from 'lucide-react';
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
          Analyseur de Trafic & Stratégie de Croissance
        </h1>
        <div className="flex gap-4 mb-4">
          <input
            type="text"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            placeholder="Entrez le nom de la chaîne YouTube"
            className="flex-1 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            onClick={() => handleAnalyze()}
            disabled={isLoading || !channelName}
            className="px-6 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2"
          >
            {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
            Analyser
          </button>
        </div>

        {history.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">Récent :</span>
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
          <p className="text-sm text-slate-500 animate-pulse">L'IA recherche les données publiques réelles de la chaîne...</p>
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
          {/* Key Metrics Overview */}
          <div className="bg-white dark:bg-[#1a1b20] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm md:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-500" />
              Performances Publiques Estimées
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 dark:bg-[#0f1115] p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <p className="text-xs font-medium text-slate-500">Vues Mensuelles</p>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{analysis.monthly_views_estimate}</p>
              </div>
              <div className="bg-slate-50 dark:bg-[#0f1115] p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-4 w-4 text-emerald-500" />
                  <p className="text-xs font-medium text-slate-500">Revenus Mensuels</p>
                </div>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{analysis.monthly_revenue_estimate}</p>
              </div>
              <div className="bg-slate-50 dark:bg-[#0f1115] p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <Crown className="h-4 w-4 text-amber-500" />
                  <p className="text-xs font-medium text-slate-500">Score d'Autorité</p>
                </div>
                <div className="flex items-end gap-1">
                  <p className="text-lg font-bold text-slate-900 dark:text-white">{analysis.channel_authority_score}</p>
                  <p className="text-xs text-slate-500 mb-1">/100</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-[#0f1115] p-4 rounded-xl border border-slate-100 dark:border-slate-800/50">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-purple-500" />
                  <p className="text-xs font-medium text-slate-500">Moteur Principal</p>
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2">{analysis.primary_traffic_driver}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1b20] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
              Distribution du Trafic (Estimation)
            </h2>
            <div className="space-y-3">
              {analysis.traffic_sources?.map((s: any, i: number) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">{s.source}</span>
                  <div className="flex items-center gap-3 w-1/2">
                    <div className="h-2 flex-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ width: `${s.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-white w-10 text-right">{s.percentage}%</span>
                  </div>
                </div>
              ))}
              {(!analysis.traffic_sources || analysis.traffic_sources.length === 0) && (
                <p className="text-sm text-slate-500 italic">Données de sources non disponibles.</p>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1b20] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Audience & Engagement
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Géographie Principale</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{analysis.audience_geography}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Rétention Estimée</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{analysis.engagement_metrics?.estimated_retention}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Taux d'Engagement</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white">{analysis.engagement_metrics?.engagement_rate}</p>
                </div>
              </div>
              {analysis.engagement_metrics?.best_content_format && (
                <div className="flex items-start gap-3">
                  <Sparkles className="h-5 w-5 text-amber-500 mt-0.5" />
                  <div>
                    <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Format Gagnant</p>
                    <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">{analysis.engagement_metrics.best_content_format}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Growth Trends & Niche Benchmarking */}
          <div className="bg-white dark:bg-[#1a1b20] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              Tendances de Croissance
            </h2>
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-[#0f1115] rounded-xl border border-slate-100 dark:border-slate-800">
                <p className="text-xs font-medium text-slate-500 uppercase mb-1">Trajectoire</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{analysis.growth_trends?.trajectory}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] font-medium text-slate-500 uppercase">Abonnés</p>
                  <p className="text-xs font-bold text-emerald-600">{analysis.growth_trends?.subscriber_trend}</p>
                </div>
                <div>
                  <p className="text-[10px] font-medium text-slate-500 uppercase">Vues</p>
                  <p className="text-xs font-bold text-blue-600">{analysis.growth_trends?.view_trend}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1b20] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-500" />
              Positionnement de Niche
            </h2>
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-800/50">
                <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase mb-1">Position sur le Marché</p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{analysis.niche_benchmarking?.market_position}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase mb-2">Concurrents Directs</p>
                <div className="flex flex-wrap gap-2">
                  {analysis.niche_benchmarking?.competitors?.map((c: string, i: number) => (
                    <span key={i} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[10px] font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase mb-1">Avantage Concurrentiel</p>
                <p className="text-xs text-slate-600 dark:text-slate-400 italic">{analysis.niche_benchmarking?.competitive_advantage}</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#1a1b20] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm md:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recommandations Stratégiques</h2>
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
              Top 5 Vidéos (Historique)
            </h2>
            <div className="space-y-3">
              {topVideos.map((v, i) => (
                <a 
                  key={i} 
                  href={v.url?.startsWith('http') ? v.url : `https://www.youtube.com/results?search_query=${encodeURIComponent(v.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 dark:bg-[#0f1115] rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group gap-2"
                >
                  <span className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 line-clamp-1">{v.title}</span>
                  <div className="flex items-center gap-4 shrink-0">
                    <span className="text-xs text-slate-400">{v.published_date}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-[#1a1b20] px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">{v.views}</span>
                  </div>
                </a>
              ))}
              {topVideos.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-sm text-slate-500 italic mb-4">Aucune vidéo trouvée.</p>
                  <button 
                    onClick={() => handleAnalyze()}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-2 mx-auto"
                  >
                    <RefreshCw className="h-4 w-4" /> Réessayer l'analyse
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Magic Strategy */}
          {strategy && (
            <div className="relative overflow-hidden rounded-2xl md:col-span-2 mt-4">
              <div className={`bg-gradient-to-br from-slate-900 to-indigo-950 p-1 border-2 border-indigo-500/30 shadow-2xl rounded-2xl transition-all duration-700 ${!isPro ? 'blur-xl opacity-40 select-none pointer-events-none' : ''}`}>
                <div className="bg-slate-900/80 backdrop-blur-xl p-6 md:p-8 rounded-xl h-full">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                      <Rocket className="h-8 w-8 text-indigo-400" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                        La Solution Parfaite <Sparkles className="h-5 w-5 text-yellow-400" />
                      </h2>
                      <p className="text-indigo-200/80 text-sm">Plan d'action sur-mesure pour {channelName}</p>
                    </div>
                  </div>

                  <p className="text-lg text-indigo-100 mb-8 font-medium leading-relaxed border-l-4 border-indigo-500 pl-4">{strategy.strategy_summary}</p>
                  
                  {/* Content Pillars */}
                  <div className="mb-8 grid gap-4 sm:grid-cols-3">
                    {strategy.content_pillars?.map((pillar: string, i: number) => (
                      <div key={i} className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl">
                        <p className="text-[10px] font-bold text-indigo-400 uppercase mb-1">Pilier {i + 1}</p>
                        <p className="text-sm font-bold text-white leading-tight">{pillar}</p>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-8">
                    {strategy.perfect_roadmap?.map((phase: any, index: number) => (
                      <div key={index} className="relative pl-8 md:pl-0">
                        {/* Timeline line for mobile */}
                        <div className="md:hidden absolute left-3 top-0 bottom-0 w-px bg-indigo-500/30"></div>
                        
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-colors relative">
                          {/* Timeline dot for mobile */}
                          <div className="md:hidden absolute -left-6 top-8 w-4 h-4 rounded-full bg-indigo-500 border-4 border-slate-900"></div>
                          
                          <div className="flex items-start gap-4 mb-4">
                            <div className="hidden md:flex shrink-0 w-10 h-10 rounded-full bg-indigo-600 items-center justify-center font-bold text-white shadow-lg shadow-indigo-600/30">
                              {index + 1}
                            </div>
                            <div>
                              <h3 className="text-xl font-bold text-white mb-1">{phase.phase_name}</h3>
                              <p className="text-indigo-300 text-sm font-medium flex items-center gap-2">
                                <Target className="h-4 w-4" /> Objectif : {phase.objective}
                              </p>
                            </div>
                          </div>
                          
                          <ul className="space-y-3 md:pl-14">
                            {phase.action_steps?.map((step: string, stepIdx: number) => (
                              <li key={stepIdx} className="flex items-start gap-3 text-indigo-100/90">
                                <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
                                <span>{step}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Monetization Roadmap */}
                  <div className="mt-8 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-emerald-400 mb-4 flex items-center gap-2">
                      <DollarSign className="h-5 w-5" />
                      Roadmap de Monétisation
                    </h3>
                    <ul className="grid gap-3 sm:grid-cols-2">
                      {strategy.monetization_roadmap?.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-emerald-100/90">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-1" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-8 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-2xl p-6">
                    <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      La Sauce Secrète (Tactiques Avancées)
                    </h3>
                    <ul className="space-y-3">
                      {strategy.secret_sauce?.map((tactic: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 text-amber-100/90">
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0 mt-2"></div>
                          <span>{tactic}</span>
                        </li>
                      ))}
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
                    <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">DÉBLOQUEZ LA SOLUTION PARFAITE</h4>
                    <p className="text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
                      Notre IA de pointe a généré une feuille de route personnalisée et infaillible pour <b>{channelName}</b>. 
                      Passez au mode Pro pour voir le plan d'action complet.
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
