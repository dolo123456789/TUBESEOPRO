import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Search, Video, Eye, MousePointerClick, Tag, X, CheckCircle2, AlertCircle, PieChart, Activity, Info, Loader2, History, Gavel, ArrowRight, Download, Zap, ShieldCheck, Play, ArrowUpRight, ArrowDownRight, Clock, MessageSquare, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../lib/utils';
import { ai, fetchPoliticalPredictions } from '../services/geminiService';
import { useProMode } from '../context/ProModeContext';

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

const subscriberData = [
  { name: 'Lun', subscribers: 4000 },
  { name: 'Mar', subscribers: 3000 },
  { name: 'Mer', subscribers: 2000 },
  { name: 'Jeu', subscribers: 2780 },
  { name: 'Ven', subscribers: 1890 },
  { name: 'Sam', subscribers: 2390 },
  { name: 'Dim', subscribers: 3490 },
];

const viewData = [
  { name: 'Lun', views: 4000 },
  { name: 'Mar', views: 3000 },
  { name: 'Mer', views: 2000 },
  { name: 'Jeu', views: 2780 },
  { name: 'Ven', views: 1890 },
  { name: 'Sam', views: 2390 },
  { name: 'Dim', views: 3490 },
];

const recentAnalyses = [
  { 
    id: '1',
    title: 'Comment apprendre React en 2024', 
    score: 92, 
    status: 'Excellent', 
    date: 'Il y a 2h', 
    views: '125K', 
    ctr: '8.4%', 
    keyword: 'React 2024',
    thumbnail: 'https://picsum.photos/seed/react/320/180',
    seoScore: 92,
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
    id: '2',
    title: 'Mon Tour de Bureau (Desk Setup)', 
    score: 68, 
    status: 'À améliorer', 
    date: 'Il y a 5h', 
    views: '12K', 
    ctr: '3.2%', 
    keyword: 'Desk Setup',
    thumbnail: 'https://picsum.photos/seed/setup/320/180',
    seoScore: 68,
    insights: [
      "La qualité vidéo est bonne, mais le titre manque de contexte."
    ],
    improvements: [
      "Le CTR est faible (3.2%). La miniature doit être plus lumineuse.",
      "Le titre 'Mon Tour de Bureau' est trop générique. Essayez 'Mon Bureau Minimaliste à 5000€'."
    ]
  },
  { 
    id: '3',
    title: '10 Conseils pour un Meilleur Code', 
    score: 85, 
    status: 'Bon', 
    date: 'Hier', 
    views: '45K', 
    ctr: '6.1%', 
    keyword: 'Conseils Code',
    thumbnail: 'https://picsum.photos/seed/code/320/180',
    seoScore: 85,
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
    id: '4',
    title: 'Pourquoi j\'ai changé pour Neovim', 
    score: 74, 
    status: 'Moyen', 
    date: 'Il y a 2j', 
    views: '89K', 
    ctr: '5.5%', 
    keyword: 'Neovim',
    thumbnail: 'https://picsum.photos/seed/neovim/320/180',
    seoScore: 74,
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
    id: '5',
    title: 'Maîtriser Tailwind CSS', 
    score: 88, 
    status: 'Bon', 
    date: 'Il y a 3j', 
    views: '210K', 
    ctr: '7.9%', 
    keyword: 'Tailwind CSS',
    thumbnail: 'https://picsum.photos/seed/tailwind/320/180',
    seoScore: 88,
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
  const { isPro } = useProMode();
  const [timeRange, setTimeRange] = useState<'7' | '30'>('7');
  const [selectedAnalysis, setSelectedAnalysis] = useState<typeof recentAnalyses[0] | null>(null);
  const [selectedStat, setSelectedStat] = useState<string | null>(null);
  const [detailedAnalysis, setDetailedAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [keywordHistory, setKeywordHistory] = useState<string[]>([]);
  const [latestPrediction, setLatestPrediction] = useState<any>(null);
  const [liveCPCs, setLiveCPCs] = useState<any[]>([]);
  const [isCPCLoading, setIsCPCLoading] = useState(false);

  useEffect(() => {
    const history = localStorage.getItem('tubeseo_keyword_history');
    if (history) {
      setKeywordHistory(JSON.parse(history).slice(0, 5));
    }

    const loadLiveCPCs = async () => {
      if (!isPro) return;
      setIsCPCLoading(true);
      try {
        const trendingKeywords = ['YouTube SEO', 'Marketing Digital Sénégal', 'E-commerce Afrique', 'Monétisation YouTube'];
        const results = await Promise.all(
          trendingKeywords.map(async (kw) => {
            const data = await ai.models.generateContent({
              model: 'gemini-3-flash-preview',
              contents: `Fournissez uniquement le CPC estimé en USD pour le mot-clé "${kw}" au Sénégal. Répondez avec un nombre uniquement.`,
            });
            return { keyword: kw, cpc: parseFloat(data.text || '0') };
          })
        );
        setLiveCPCs(results);
      } catch (err) {
        console.error('Error loading live CPCs:', err);
      } finally {
        setIsCPCLoading(false);
      }
    };

    const loadLatestPrediction = async () => {
      try {
        const predictions = await fetchPoliticalPredictions();
        if (predictions && predictions.length > 0) {
          setLatestPrediction(predictions[0]);
        }
      } catch (err) {
        console.error('Error loading prediction for dashboard:', err);
      }
    };
    loadLatestPrediction();
    if (isPro) loadLiveCPCs();
  }, [isPro]);

  const handleStatClick = (tab: string) => {
    const proTabs = ['traffic', 'predictions', 'simulator'];
    if (proTabs.includes(tab) && !isPro) {
      setActiveTab('pricing');
      return;
    }
    setActiveTab(tab);
  };

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

  const currentData = timeRange === '7' ? data7Days : data30Days;

  const exportToCSV = () => {
    const headers = ['Période', 'Vues', 'Abonnés'];
    const rows = currentData.map(d => [d.name, d.views, d.subs]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `youtube_stats_${timeRange}d.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const seoGaugeData = [
    { name: 'Score', value: 84 },
    { name: 'Restant', value: 16 },
  ];
  const COLORS = ['#4f46e5', '#e2e8f0'];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            Tableau de Bord
            {isPro && <span className="text-[10px] bg-indigo-600 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-widest">Pro</span>}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Analytique en temps réel pour votre chaîne YouTube.</p>
        </motion.div>
        <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-[#1a1b20] border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            <Download className="h-4 w-4" />
            Exporter CSV
          </button>
          <div className="flex items-center gap-2 bg-white dark:bg-[#1a1b20] p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <button 
              onClick={() => setTimeRange('7')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeRange === '7' 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              7 Jours
            </button>
            <button 
              onClick={() => setTimeRange('30')}
              className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                timeRange === '30' 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              30 Jours
            </button>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-6 auto-rows-[minmax(180px,auto)]">
        {/* Main Stats - Bento Style */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-2 lg:col-span-3 glass-card rounded-[2.5rem] p-8 flex flex-col justify-between group overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <TrendingUp className="h-32 w-32" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
                <Users className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Abonnés Totaux</span>
            </div>
            <h3 className="text-6xl font-black tracking-tighter mb-2">124.5k</h3>
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
              <ArrowUpRight className="h-4 w-4" />
              <span>+12.5% ce mois</span>
            </div>
          </div>
          <div className="mt-8 h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={subscriberData}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="subscribers" stroke="#6366f1" fillOpacity={1} fill="url(#colorSub)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 lg:col-span-3 glass-card rounded-[2.5rem] p-8 flex flex-col justify-between group overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <Eye className="h-32 w-32" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-rose-500/10 rounded-xl text-rose-500">
                <Play className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Vues Totales</span>
            </div>
            <h3 className="text-6xl font-black tracking-tighter mb-2">2.8M</h3>
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm">
              <ArrowUpRight className="h-4 w-4" />
              <span>+8.2% ce mois</span>
            </div>
          </div>
          <div className="mt-8 h-24 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={viewData}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <Area type="monotone" dataKey="views" stroke="#f43f5e" fillOpacity={1} fill="url(#colorViews)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Secondary Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-2 lg:col-span-2 glass-card rounded-[2.5rem] p-8 flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
              <Clock className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Durée de visionnage</span>
          </div>
          <div>
            <h3 className="text-4xl font-black tracking-tighter mb-1">45.2k</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Heures totales</p>
          </div>
          <div className="mt-6 flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '75%' }} />
            </div>
            <span className="text-[10px] font-black text-amber-500">75%</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-2 lg:col-span-2 glass-card rounded-[2.5rem] p-8 flex flex-col justify-between"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-indigo-500/10 rounded-xl text-indigo-500">
              <MessageSquare className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Engagement</span>
          </div>
          <div>
            <h3 className="text-4xl font-black tracking-tighter mb-1">12.4%</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Taux moyen</p>
          </div>
          <div className="mt-6 flex items-center gap-2">
            <div className="flex-1 h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '62%' }} />
            </div>
            <span className="text-[10px] font-black text-indigo-500">62%</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="md:col-span-4 lg:col-span-2 glass-card rounded-[2.5rem] p-8 flex flex-col justify-between bg-indigo-600 text-white border-none"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 bg-white/20 rounded-xl">
              <Zap className="h-5 w-5" />
            </div>
            <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">PRO</span>
          </div>
          <div>
            <h3 className="text-2xl font-black tracking-tight mb-2 leading-tight">Optimisez votre chaîne avec l'IA</h3>
            <p className="text-xs font-bold text-indigo-100 uppercase tracking-wide leading-relaxed">Générez des titres viraux et des miniatures en un clic.</p>
          </div>
          <button className="mt-6 w-full py-4 bg-white text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-colors">
            Essayer maintenant
          </button>
        </motion.div>

        {/* Recent Activity - Large Bento */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="md:col-span-4 lg:col-span-4 glass-card rounded-[2.5rem] p-8"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-black tracking-tight uppercase">Analyses Récentes</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Vos 5 dernières vidéos analysées</p>
            </div>
            <button className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl hover:bg-indigo-500 hover:text-white transition-all">
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {recentAnalyses.map((analysis, index) => (
              <div 
                key={analysis.id}
                className="group flex items-center gap-6 p-4 rounded-3xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer border border-transparent hover:border-slate-100 dark:hover:border-white/10"
              >
                <div className="relative h-20 w-32 rounded-2xl overflow-hidden shadow-lg">
                  <img 
                    src={analysis.thumbnail} 
                    alt={analysis.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-black uppercase tracking-tight truncate group-hover:text-indigo-600 transition-colors">{analysis.title}</h4>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <Eye className="h-3 w-3" />
                      <span>{analysis.views}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <TrendingUp className="h-3 w-3" />
                      <span>SEO: {analysis.seoScore}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                    analysis.seoScore >= 80 ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                  )}>
                    {analysis.seoScore >= 80 ? 'Excellent' : 'À améliorer'}
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-300 group-hover:text-indigo-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="md:col-span-4 lg:col-span-2 glass-card rounded-[2.5rem] p-8 flex flex-col"
        >
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-black tracking-tight uppercase">Santé SEO</h3>
            <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[8px] font-black uppercase tracking-widest">
              Optimal
            </div>
          </div>
          
          <div className="flex-1 flex flex-col justify-center items-center gap-6">
            <div className="relative h-48 w-48">
              <svg className="h-full w-full" viewBox="0 0 100 100">
                <circle
                  className="text-slate-100 dark:text-white/5 stroke-current"
                  strokeWidth="10"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
                <motion.circle
                  initial={{ strokeDashoffset: 251.2 }}
                  animate={{ strokeDashoffset: 251.2 * (1 - 0.78) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className="text-indigo-600 stroke-current"
                  strokeWidth="10"
                  strokeDasharray="251.2"
                  strokeLinecap="round"
                  fill="transparent"
                  r="40"
                  cx="50"
                  cy="50"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-black tracking-tighter">78%</span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global</span>
              </div>
            </div>

            <div className="w-full space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mots-clés</span>
                <span className="text-xs font-black text-emerald-500">85%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '85%' }} />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Titres</span>
                <span className="text-xs font-black text-amber-500">62%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '62%' }} />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Live CPC Tracker - New Bento */}
        {isPro && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="md:col-span-4 lg:col-span-2 glass-card rounded-[2.5rem] p-8 flex flex-col bg-emerald-600 text-white border-none"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Activity className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-black tracking-tight uppercase">Live CPC Sénégal</h3>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full text-[8px] font-black animate-pulse">
                <div className="h-1 w-1 bg-white rounded-full" />
                LIVE
              </div>
            </div>

            <div className="flex-1 space-y-4">
              {isCPCLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <Loader2 className="h-8 w-8 animate-spin opacity-50" />
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Récupération des données...</p>
                </div>
              ) : (
                liveCPCs.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-white/10 rounded-2xl border border-white/10 hover:bg-white/20 transition-all">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{item.keyword}</p>
                      <p className="text-lg font-black tracking-tighter">${item.cpc.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black uppercase tracking-widest opacity-50">XOF</p>
                      <p className="text-xs font-black">~{Math.round(item.cpc * 600)} F</p>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <button 
              onClick={() => setActiveTab('keyword')}
              className="mt-6 w-full py-3 bg-white text-emerald-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 transition-colors"
            >
              Rechercher d'autres mots-clés
            </button>
          </motion.div>
        )}
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
                    'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400'
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
                    handleStatClick('video');
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
                  handleStatClick('traffic');
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
    </motion.div>
  );
}
