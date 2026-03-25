import React, { useState } from 'react';
import { 
  Youtube, 
  Search, 
  Copy, 
  CheckCircle2, 
  Sparkles, 
  Loader2, 
  Globe, 
  Hash,
  ShieldCheck,
  Zap,
  FileText,
  Target,
  Users,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ai } from '../services/geminiService';
import { cn } from '../lib/utils';

interface SEOResult {
  channelName: string;
  handle: string;
  subscriberCount: string;
  videoCount: string;
  avatarUrl?: string;
  bannerUrl?: string;
  joinedDate: string;
  videos: {
    title: string;
    views: string;
    time: string;
    thumbnailUrl: string;
  }[];
  playlists: {
    title: string;
    videoCount: string;
    thumbnailUrl: string;
  }[];
  niche: string;
  keywordCategories: {
    category: string;
    keywords: string[];
  }[];
  description: string;
  targetAudience: string;
  uniqueValue: string;
  strategicAdvice: string[];
  recommendedCountry: string;
  recommendedLanguage: string;
  seoStrength: number;
  videoIdeas: {
    title: string;
    hook: string;
    targetCTR: string;
  }[];
  titleStrategy: {
    pattern: string;
    example: string;
  }[];
  algorithmChecks: {
    indexability: boolean;
    relevance: boolean;
    authority: boolean;
  };
  roadmap: {
    step: string;
    action: string;
    impact: string;
  }[];
}

export function ChannelSEOView() {
  const [channelUrl, setChannelUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [seoResult, setSeoResult] = useState<SEOResult | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [recentAnalyses, setRecentAnalyses] = useState<SEOResult[]>([]);

  // Load recent analyses from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem('recent_youtube_seo');
    if (saved) {
      try {
        setRecentAnalyses(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load recent analyses", e);
      }
    }
  }, []);

  const saveAnalysis = (result: SEOResult) => {
    const updated = [result, ...recentAnalyses.filter(r => r.channelName !== result.channelName)].slice(0, 5);
    setRecentAnalyses(updated);
    localStorage.setItem('recent_youtube_seo', JSON.stringify(updated));
  };

  const handleGenerateSEO = async () => {
    if (!channelUrl) return;
    setIsAnalyzing(true);
    try {
      const prompt = `En tant qu'expert SEO YouTube mondial de haut niveau, analyse RÉELLEMENT cette chaîne : ${channelUrl}.
      
      TA MISSION : 
      1. Extraire les données RÉELLES de la chaîne (Nom, Handle, nombre d'abonnés EXACT, nombre de vidéos) en accédant à l'URL fournie.
      2. RÉCUPÉRER IMPÉRATIVEMENT l'URL du LOGO (avatar) et de la BANNIÈRE de la chaîne. Cherche dans les balises meta (og:image) ou les sélecteurs YouTube.
      3. Générer un rapport de configuration SEO PROFESSIONNEL, COMPLET et ENTIÈREMENT ADAPTÉ à cette niche spécifique.
      
      Réponds au format JSON uniquement avec cette structure :
      {
        "channelName": "Nom réel de la chaîne",
        "handle": "@handle_reel",
        "subscriberCount": "Nombre réel d'abonnés (ex: 1.6K)",
        "videoCount": "Nombre réel de vidéos",
        "avatarUrl": "URL RÉELLE ET DIRECTE du logo/avatar (souvent se terminant par =s800-c-k-c0x00ffffff-no-rj)",
        "bannerUrl": "URL RÉELLE ET DIRECTE de la bannière (souvent se terminant par =w2120-fcrop64=1,00005a57ffffffff-k-c0x00ffffff-no-nd-rj)",
        "joinedDate": "Date d'inscription réelle (ex: 12 mars 2021)",
        "videos": [
          {"title": "Titre vidéo réelle 1", "views": "vues réelles", "time": "il y a X jours", "thumbnailUrl": "URL miniature réelle"},
          {"title": "Titre vidéo réelle 2", "views": "vues réelles", "time": "il y a X jours", "thumbnailUrl": "URL miniature réelle"},
          {"title": "Titre vidéo réelle 3", "views": "vues réelles", "time": "il y a X jours", "thumbnailUrl": "URL miniature réelle"}
        ],
        "playlists": [
          {"title": "Nom playlist réelle 1", "videoCount": "X vidéos", "thumbnailUrl": "URL miniature réelle"},
          {"title": "Nom playlist réelle 2", "videoCount": "X vidéos", "thumbnailUrl": "URL miniature réelle"}
        ],
        "niche": "Nom précis de la niche réelle",
        "keywordCategories": [
          {"category": "Nom de la catégorie 1", "keywords": ["tag1", "tag2", ...]},
          {"category": "Nom de la catégorie 2", "keywords": [...]},
          {"category": "Nom de la catégorie 3", "keywords": [...]},
          {"category": "Nom de la catégorie 4", "keywords": [...]}
        ],
        "description": "Une description de chaîne de 1000 caractères optimisée SEO, captivante, utilisant les mots-clés de manière naturelle.",
        "targetAudience": "Description détaillée de l'audience cible réelle.",
        "uniqueValue": "Quelle est la proposition de valeur unique réelle ?",
        "strategicAdvice": ["Conseil stratégique spécifique 1", "Conseil stratégique spécifique 2"],
        "recommendedCountry": "Le pays réel de la chaîne",
        "recommendedLanguage": "La langue réelle",
        "seoStrength": 98,
        "videoIdeas": [
          {"title": "Titre accrocheur 1", "hook": "L'accroche des 30 premières secondes", "targetCTR": "8-12%"},
          {"title": "Titre accrocheur 2", "hook": "L'accroche...", "targetCTR": "10-15%"}
        ],
        "titleStrategy": [
          {"pattern": "Le pattern (ex: La peur de rater)", "example": "Pourquoi vous échouez en X..."},
          {"pattern": "Le pattern (ex: Le secret révélé)", "example": "J'ai testé X pendant 30 jours..."}
        ],
        "algorithmChecks": {
          "indexability": true,
          "relevance": true,
          "authority": true
        },
        "roadmap": [
          {"step": "Phase 1", "action": "Action immédiate", "impact": "Impact attendu"},
          {"step": "Phase 2", "action": "Action à moyen terme", "impact": "Impact attendu"},
          {"step": "Phase 3", "action": "Action de croissance", "impact": "Impact attendu"}
        ]
      }
      
      IMPORTANT : 
      - NE PAS INVENTER DE DONNÉES. Si tu ne peux pas accéder à l'URL, utilise les informations textuelles fournies mais ne hallucine pas de chiffres.
      - La description doit être prête à être copiée-collée.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          { text: prompt },
          { text: channelUrl }
        ],
        config: {
          responseMimeType: "application/json",
          tools: [{ urlContext: {} }]
        },
      });
      
      const result = JSON.parse(response.text || '{}');
      setSeoResult(result);
      saveAnalysis(result);
    } catch (error) {
      console.error('Erreur SEO :', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8 py-6 px-4"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-[0.3em]">
            <Zap className="h-4 w-4 fill-current" />
            YouTube Intelligence v2.0
          </div>
          <h1 className="text-4xl font-black text-slate-900 dark:text-white sm:text-6xl tracking-tight leading-none">
            SEO <span className="text-indigo-600">Architect</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl text-lg font-medium">
            Propulsez votre chaîne avec une stratégie algorithmique sur-mesure.
          </p>
        </div>
        
        {recentAnalyses.length > 0 && (
          <div className="flex -space-x-3">
            {recentAnalyses.map((item, i) => (
              <button
                key={i}
                onClick={() => setSeoResult(item)}
                className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 overflow-hidden hover:scale-110 hover:z-20 transition-all shadow-lg group relative"
                title={item.channelName}
              >
                {item.avatarUrl ? (
                  <img src={item.avatarUrl} alt={item.channelName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-slate-400">
                    {item.channelName.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-[#1a1b20] p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 p-4 opacity-[0.03] rotate-12">
          <Youtube className="h-64 w-64" />
        </div>
        
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-3 text-indigo-600 font-black text-sm uppercase tracking-[0.2em]">
            <Target className="h-5 w-5" />
            Analyse de Contexte
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-black text-slate-700 dark:text-slate-300 uppercase">
                Lien de la chaîne ou Description du projet
              </label>
              <button 
                onClick={() => setChannelUrl("Politique Sénégal, Lutte Sénégalaise (Lamb), Actualité Dakar")}
                className="text-[10px] font-black text-indigo-600 hover:text-indigo-700 uppercase tracking-widest bg-indigo-50 dark:bg-indigo-900/20 px-2 py-1 rounded-lg transition-colors"
              >
                Exemple: Niche Sénégal 🇸🇳
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Youtube className="h-6 w-6 text-indigo-500" />
                </div>
                <input
                  type="text"
                  value={channelUrl}
                  onChange={(e) => setChannelUrl(e.target.value)}
                  placeholder="Collez le lien de votre chaîne ici..."
                  className="block w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-[#0f1115] border-2 border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-slate-900 dark:text-white placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none text-lg font-medium"
                />
              </div>
              <button
                onClick={handleGenerateSEO}
                disabled={isAnalyzing || !channelUrl}
                className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-black rounded-[1.5rem] transition-all shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 text-lg group"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="h-6 w-6 group-hover:rotate-12 transition-transform" />
                    GÉNÉRER LE PLAN SEO
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {seoResult && (
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              {/* Left Column: Keywords & Roadmap */}
              <div className="lg:col-span-8 space-y-8">
                  {/* Niche Detected Badge */}
                  <div className="bg-indigo-600 p-6 rounded-[2rem] shadow-lg text-white flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white/20 rounded-2xl">
                        <Target className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase tracking-widest opacity-80">Niche Détectée</p>
                        <h2 className="text-xl font-black">{seoResult.niche}</h2>
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <Sparkles className="h-8 w-8 opacity-20" />
                    </div>
                  </div>

                  {/* Categorized Keywords */}
                  <div className="bg-white dark:bg-[#1a1b20] p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <Hash className="h-6 w-6 text-indigo-500" />
                        Mots-clés Catégorisés
                      </h2>
                      <button
                        onClick={() => copyToClipboard(seoResult.keywordCategories.flatMap(c => c.keywords).join(', '), 'keywords')}
                        className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:opacity-90 transition-all text-sm font-black uppercase tracking-wider"
                      >
                        {copiedSection === 'keywords' ? 'Copié' : 'Copier tout'}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {seoResult.keywordCategories.map((cat, idx) => (
                        <div key={idx} className="space-y-3">
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">{cat.category}</h3>
                          <div className="flex flex-wrap gap-2">
                            {cat.keywords.map((kw, kIdx) => (
                              <span key={kIdx} className="px-3 py-1.5 bg-slate-50 dark:bg-[#0f1115] border border-slate-100 dark:border-slate-800 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400">
                                {kw}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Roadmap Card */}
                  <div className="bg-white dark:bg-[#1a1b20] p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                      <ArrowRight className="h-6 w-6 text-emerald-500" />
                      Feuille de Route (Roadmap)
                    </h2>
                    <div className="space-y-6">
                      {seoResult.roadmap.map((step, i) => (
                        <div key={i} className="flex gap-6 relative">
                          {i !== seoResult.roadmap.length - 1 && (
                            <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-slate-100 dark:bg-slate-800" />
                          )}
                          <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-[#0f1115] border border-slate-100 dark:border-slate-800 flex items-center justify-center shrink-0 z-10">
                            <span className="text-indigo-600 font-black">{i + 1}</span>
                          </div>
                          <div className="space-y-1 pb-6">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{step.step}</span>
                              <div className="px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[10px] font-black rounded-md">
                                {step.impact}
                              </div>
                            </div>
                            <h4 className="font-bold text-slate-900 dark:text-white">{step.action}</h4>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Video Ideas Section */}
                  <div className="bg-white dark:bg-[#1a1b20] p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 flex items-center gap-3">
                      <Sparkles className="h-6 w-6 text-yellow-500" />
                      Idées de Vidéos Virales
                    </h2>
                    <div className="grid grid-cols-1 gap-4">
                      {seoResult.videoIdeas?.map((idea, i) => (
                        <div key={i} className="p-6 bg-slate-50 dark:bg-[#0f1115] rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-indigo-500/30 transition-all group">
                          <div className="flex justify-between items-start mb-3">
                            <h4 className="font-black text-slate-900 dark:text-white text-lg group-hover:text-indigo-600 transition-colors">{idea.title}</h4>
                            <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 text-[10px] font-black rounded-lg">CTR: {idea.targetCTR}</span>
                          </div>
                          <p className="text-sm text-slate-500 dark:text-slate-400 italic">
                            <span className="font-black text-slate-400 uppercase text-[10px] mr-2">Hook:</span>
                            {idea.hook}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Stats & Settings */}
                <div className="lg:col-span-4 space-y-8">
                  {/* SEO Strength Indicator */}
                  <div className="bg-white dark:bg-[#1a1b20] p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Force SEO</h3>
                      <span className="text-2xl font-black text-emerald-500">{seoResult.seoStrength}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden mb-6">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${seoResult.seoStrength}%` }}
                        className="h-full bg-emerald-500"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter">
                        <span className="text-slate-500">Indexabilité</span>
                        <span className={seoResult.algorithmChecks.indexability ? "text-emerald-500" : "text-red-500"}>
                          {seoResult.algorithmChecks.indexability ? "Vérifié" : "Échec"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter">
                        <span className="text-slate-500">Pertinence Algorithmique</span>
                        <span className={seoResult.algorithmChecks.relevance ? "text-emerald-500" : "text-red-500"}>
                          {seoResult.algorithmChecks.relevance ? "Validé" : "Échec"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-tighter">
                        <span className="text-slate-500">Potentiel d'Autorité</span>
                        <span className={seoResult.algorithmChecks.authority ? "text-emerald-500" : "text-red-500"}>
                          {seoResult.algorithmChecks.authority ? "Élevé" : "Faible"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Title Strategy */}
                  <div className="bg-white dark:bg-[#1a1b20] p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-500" />
                      Stratégie de Titres
                    </h3>
                    <div className="space-y-4">
                      {seoResult.titleStrategy?.map((strat, i) => (
                        <div key={i} className="p-4 bg-slate-50 dark:bg-[#0f1115] rounded-xl border border-slate-100 dark:border-slate-800">
                          <p className="text-[10px] font-black text-indigo-500 uppercase mb-1">{strat.pattern}</p>
                          <p className="text-xs font-bold text-slate-900 dark:text-white italic">"{strat.example}"</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Regional Settings */}
                  <div className="bg-white dark:bg-[#1a1b20] p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Paramètres Recommandés</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0f1115] rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-500">Pays</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">{seoResult.recommendedCountry}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0f1115] rounded-xl border border-slate-100 dark:border-slate-800">
                        <span className="text-xs font-bold text-slate-500">Langue</span>
                        <span className="text-sm font-black text-slate-900 dark:text-white">{seoResult.recommendedLanguage}</span>
                      </div>
                    </div>
                  </div>

                  {/* Audience & Value */}
                  <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-[2rem] shadow-xl text-white space-y-8">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-indigo-400 font-black text-xs uppercase tracking-widest">
                        <Users className="h-4 w-4" />
                        Audience Cible
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {seoResult.targetAudience}
                      </p>
                    </div>

                    <div className="h-px bg-white/10" />

                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-emerald-400 font-black text-xs uppercase tracking-widest">
                        <Zap className="h-4 w-4" />
                        Valeur Unique
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {seoResult.uniqueValue}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
