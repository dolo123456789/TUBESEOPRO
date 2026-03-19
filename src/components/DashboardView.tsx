import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Search, Video, Eye, MousePointerClick, Tag, X, CheckCircle2, AlertCircle, PieChart, Activity, Info, Loader2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from './Layout';

const apiKey = typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : (import.meta as any).env?.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: apiKey || '' });

const data7Days = [
  { name: 'Lun', views: 4000, subs: 24 },
  { name: 'Mar', views: 3000, subs: 13 },
  { name: 'Mer', views: 2000, subs: 98 },
  { name: 'Jeu', views: 2780, subs: 39 },
  { name: 'Ven', views: 1890, subs: 48 },
  { name: 'Sam', views: 2390, subs: 38 },
  { name: 'Dim', views: 3490, subs: 43 },
];

const data30Days = [
  { name: 'Semaine 1', views: 25000, subs: 150 },
  { name: 'Semaine 2', views: 32000, subs: 210 },
  { name: 'Semaine 3', views: 28000, subs: 180 },
  { name: 'Semaine 4', views: 45000, subs: 320 },
];

const recentAnalyses = [
  { 
    title: 'Comment apprendre React en 2024', 
    score: 92, 
    status: 'Excellent', 
    date: 'Il y a 2h', 
    views: '125K', 
    ctr: '8.4%', 
    keyword: 'React 2024',
    insights: [
      "Le titre est très accrocheur et contient le mot-clé principal.",
      "La miniature a un excellent contraste et attire l'œil.",
      "La description est bien optimisée avec des chapitres clairs."
    ],
    improvements: [
      "Ajouter un appel à l'action plus tôt dans la vidéo.",
      "Utiliser des tags plus spécifiques (long-tail)."
    ]
  },
  { 
    title: 'Mon Tour de Bureau (Desk Setup)', 
    score: 68, 
    status: 'À améliorer', 
    date: 'Il y a 5h', 
    views: '12K', 
    ctr: '3.2%', 
    keyword: 'Desk Setup',
    insights: [
      "La qualité vidéo est bonne, mais le titre manque de contexte."
    ],
    improvements: [
      "Le CTR est faible (3.2%). La miniature doit être plus lumineuse.",
      "Le titre 'Mon Tour de Bureau' est trop générique. Essayez 'Mon Bureau Minimaliste à 5000€'."
    ]
  },
  { 
    title: '10 Conseils pour un Meilleur Code', 
    score: 85, 
    status: 'Bon', 
    date: 'Hier', 
    views: '45K', 
    ctr: '6.1%', 
    keyword: 'Conseils Code',
    insights: [
      "Bonne rétention d'audience sur les 3 premières minutes.",
      "Les tags sont pertinents et bien choisis."
    ],
    improvements: [
      "La description pourrait inclure plus de liens vers vos autres vidéos.",
      "Pensez à ajouter des sous-titres manuels pour un meilleur SEO."
    ]
  },
  { 
    title: 'Pourquoi j\'ai changé pour Neovim', 
    score: 74, 
    status: 'Moyen', 
    date: 'Il y a 2j', 
    views: '89K', 
    ctr: '5.5%', 
    keyword: 'Neovim',
    insights: [
      "Sujet très tendance dans la communauté dev.",
      "Bon engagement dans les commentaires."
    ],
    improvements: [
      "Le score SEO est moyen. Le mot-clé 'Neovim' est très concurrentiel.",
      "Essayez de cibler un mot-clé plus spécifique comme 'Neovim vs VSCode 2024'."
    ]
  },
  { 
    title: 'Maîtriser Tailwind CSS', 
    score: 88, 
    status: 'Bon', 
    date: 'Il y a 3j', 
    views: '210K', 
    ctr: '7.9%', 
    keyword: 'Tailwind CSS',
    insights: [
      "Excellent CTR (7.9%), la miniature fonctionne très bien.",
      "Le titre est clair et promet une valeur immédiate."
    ],
    improvements: [
      "Ajoutez des chapitres dans la description pour faciliter la navigation.",
      "Répondez à plus de commentaires pour booster l'engagement."
    ]
  },
];

const statDetails: Record<string, any> = {
  'Vues Totales': {
    title: 'Analyse des Vues Totales',
    description: 'Répartition détaillée des vues de votre chaîne sur la période sélectionnée.',
    insights: ['Le trafic de recherche a augmenté de 15%', 'Les Shorts génèrent 40% des nouvelles vues'],
    metrics: [
      { label: 'Recherche YouTube', value: '45%' },
      { label: 'Vidéos suggérées', value: '30%' },
      { label: 'Fonctionnalités de navigation', value: '15%' },
      { label: 'Externe', value: '10%' }
    ]
  },
  'Abonnés': {
    title: 'Croissance des Abonnés',
    description: 'Analyse de l\'acquisition et de la rétention de votre audience.',
    insights: ['Taux de conversion élevé sur les tutoriels', 'Perte de 50 abonnés après le dernier vlog'],
    metrics: [
      { label: 'Depuis les vidéos', value: '70%' },
      { label: 'Depuis les Shorts', value: '25%' },
      { label: 'Depuis la page de la chaîne', value: '5%' }
    ]
  },
  'Score SEO Moyen': {
    title: 'Performance SEO',
    description: 'Optimisation de vos vidéos pour l\'algorithme YouTube.',
    insights: ['Les titres sont parfaitement optimisés', 'Les descriptions manquent de mots-clés de longue traîne'],
    metrics: [
      { label: 'Optimisation du Titre', value: '95/100' },
      { label: 'Profondeur de la Description', value: '70/100' },
      { label: 'Pertinence des Tags', value: '85/100' },
      { label: 'CTR de la Miniature', value: '88/100' }
    ]
  },
  'Potentiel Viral': {
    title: 'Vélocité Virale',
    description: 'Indicateurs de la probabilité que votre contenu devienne viral.',
    insights: ['La vidéo "React 2024" montre une trajectoire virale', 'Taux de partage élevé sur Twitter'],
    metrics: [
      { label: 'Taux de Partage', value: '4.2%' },
      { label: 'Vélocité des Commentaires', value: '15/h' },
      { label: 'Durée Moyenne de Visionnage', value: '65%' },
      { label: 'Taux de Clic (CTR)', value: '8.4%' }
    ]
  }
};

export function DashboardView({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [timeRange, setTimeRange] = useState<'7' | '30'>('7');
  const [selectedAnalysis, setSelectedAnalysis] = useState<typeof recentAnalyses[0] | null>(null);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [detailedAnalysis, setDetailedAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const currentData = timeRange === '7' ? data7Days : data30Days;

  const handleAnalyze = async (title: string) => {
    setIsAnalyzing(true);
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analysez la vidéo intitulée "${title}" et fournissez 10 conseils détaillés pour un meilleur code basés sur ce sujet. Répondez en français.`,
      });
      setDetailedAnalysis(response.text || 'Aucune analyse disponible.');
    } catch (error) {
      console.error('Erreur d\'analyse :', error);
      setDetailedAnalysis('Erreur lors de l\'analyse.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Aperçu des Performances</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Analytique en temps réel pour votre chaîne YouTube.</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-[#1a1b20] p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button 
            onClick={() => setTimeRange('7')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              timeRange === '7' 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            7 derniers jours
          </button>
          <button 
            onClick={() => setTimeRange('30')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              timeRange === '30' 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            30 derniers jours
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Vues Totales', value: timeRange === '7' ? '2.4M' : '10.2M', icon: Video, trend: '+12.5%', color: 'indigo', span: 'lg:col-span-1' },
          { title: 'Abonnés', value: timeRange === '7' ? '142K' : '158K', icon: Users, trend: '+4.2%', color: 'emerald', span: 'lg:col-span-1' },
          { title: 'Score SEO Moyen', value: '84/100', icon: Search, trend: '+2.1%', color: 'amber', span: 'lg:col-span-1' },
          { title: 'Potentiel Viral', value: 'Élevé', icon: TrendingUp, trend: 'Stable', color: 'violet', span: 'lg:col-span-1' },
        ].map((stat) => (
          <div 
            key={stat.title} 
            onClick={() => setSelectedStat(stat.title)}
            className={cn(
              "group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b20] p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer",
              stat.span
            )}
          >
            <div className={`absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-${stat.color}-500/5 blur-2xl group-hover:bg-${stat.color}-500/10 transition-colors`} />
            
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                stat.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
              }`}>
                {stat.trend}
              </span>
            </div>
            
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b20] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Trafic {timeRange === '7' ? 'Hebdomadaire' : 'Mensuel'}</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-indigo-500" />
                <span className="text-xs font-medium text-slate-500">Vues</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-violet-500" />
                <span className="text-xs font-medium text-slate-500">Abonnés</span>
              </div>
            </div>
          </div>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-2xl">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{payload[0].payload.name}</p>
                          <div className="space-y-1">
                            {payload.map((p: any, i: number) => (
                              <div key={i} className="flex items-center gap-4 justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{p.name}</span>
                                </div>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{p.value.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="views" name="Vues" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={timeRange === '7' ? 32 : 64} />
                <Bar dataKey="subs" name="Abonnés" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={timeRange === '7' ? 32 : 64} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b20] p-6 shadow-sm flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Analyses Récentes</h3>
            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors">Voir Tout</button>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {recentAnalyses.map((video, i) => (
              <div 
                key={i} 
                onClick={() => setSelectedAnalysis(video)}
                className="group flex flex-col gap-2 border border-slate-100 dark:border-slate-800/50 bg-slate-50/50 dark:bg-[#0f1115]/50 rounded-xl p-4 hover:bg-slate-50 dark:hover:bg-[#0f1115] transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{video.title}</h4>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                      <span>{video.date}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1 truncate">
                        <Tag className="h-3 w-3" />
                        <span className="font-medium text-slate-700 dark:text-slate-300 truncate">{video.keyword}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-slate-900 dark:text-white">{video.score}</span>
                      <div className={`h-2 w-2 rounded-full ${
                        video.score >= 85 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                        video.score >= 70 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                        'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                      }`} />
                    </div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mt-0.5">{video.status}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-2 pt-3 border-t border-slate-200 dark:border-slate-800/50">
                  <div className="flex items-center gap-1.5">
                    <Eye className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{video.views} vues</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MousePointerClick className="h-3.5 w-3.5 text-slate-400" />
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300">CTR: {video.ctr}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 shrink-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-1.5 rounded-lg bg-indigo-500 text-white">
                <TrendingUp className="h-4 w-4" />
              </div>
              <p className="text-xs font-bold text-indigo-900 dark:text-indigo-300">Analyse IA</p>
            </div>
            <p className="text-xs text-indigo-700 dark:text-indigo-400 leading-relaxed">
              Votre vidéo "React 2024" performe 40% mieux que la moyenne. Envisagez de faire une vidéo de suivi sur Next.js pour capitaliser sur le CTR élevé.
            </p>
          </div>
        </div>
      </div>

      {/* Analysis Details Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1a1b20] rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between p-6 border-b border-slate-100 dark:border-slate-800/50">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selectedAnalysis.title}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    selectedAnalysis.score >= 85 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' :
                    selectedAnalysis.score >= 70 ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' :
                    'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                  }`}>
                    Score: {selectedAnalysis.score}/100
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1.5"><Eye className="h-4 w-4" /> {selectedAnalysis.views} vues</span>
                  <span className="flex items-center gap-1.5"><MousePointerClick className="h-4 w-4" /> CTR: {selectedAnalysis.ctr}</span>
                  <span className="flex items-center gap-1.5"><Tag className="h-4 w-4" /> {selectedAnalysis.keyword}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAnalysis(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Points Forts (Insights)
                </h3>
                <ul className="space-y-2">
                  {selectedAnalysis.insights.map((insight, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                  Axes d'Amélioration
                </h3>
                <ul className="space-y-2">
                  {selectedAnalysis.improvements.map((improvement, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-[#0f1115] flex justify-end gap-3">
              <button 
                onClick={() => setSelectedAnalysis(null)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 text-sm font-bold rounded-xl transition-colors"
              >
                Fermer
              </button>
              <button 
                onClick={() => {
                  if (selectedAnalysis?.title === '10 Tips for Better Code') {
                    handleAnalyze(selectedAnalysis.title);
                  } else {
                    setSelectedAnalysis(null);
                    setActiveTab('video');
                  }
                }}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2"
              >
                {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                {isAnalyzing ? 'Analyse en cours...' : 'Analyser en détail'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Stat Details Modal */}
      {selectedStat && statDetails[selectedStat] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1a1b20] rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between p-6 border-b border-slate-100 dark:border-slate-800/50">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-500" />
                  {statDetails[selectedStat].title}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {statDetails[selectedStat].description}
                </p>
              </div>
              <button 
                onClick={() => setSelectedStat(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <PieChart className="h-4 w-4 text-slate-400" />
                  Répartition des Métriques
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {statDetails[selectedStat].metrics.map((metric: any, idx: number) => (
                    <div key={idx} className="bg-slate-50 dark:bg-[#0f1115] p-3 rounded-xl border border-slate-100 dark:border-slate-800/50">
                      <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{metric.label}</p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">{metric.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4 text-slate-400" />
                  Insights Clés
                </h3>
                <ul className="space-y-2">
                  {statDetails[selectedStat].insights.map((insight: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-slate-800/50 bg-slate-50 dark:bg-[#0f1115] flex justify-end gap-3">
              <button 
                onClick={() => setSelectedStat(null)}
                className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 text-sm font-bold rounded-xl transition-colors"
              >
                Fermer
              </button>
              <button 
                onClick={() => {
                  setSelectedStat(null);
                  setActiveTab('traffic');
                }}
                className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors shadow-lg shadow-indigo-600/20 flex items-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                Voir le trafic complet
              </button>
            </div>
          </div>
        </div>
      )}
      {detailedAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#1a1b20] rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Analyse détaillée</h3>
              <div className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
                {detailedAnalysis}
              </div>
              <button 
                onClick={() => setDetailedAnalysis(null)}
                className="mt-6 w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
