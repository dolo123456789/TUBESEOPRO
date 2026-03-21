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
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ai } from '../services/geminiService';

interface SEOResult {
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
  const [activeView, setActiveView] = useState<'strategy' | 'preview'>('strategy');

  const handleGenerateSEO = async () => {
    if (!channelUrl) return;
    setIsAnalyzing(true);
    try {
      const prompt = `En tant qu'expert SEO YouTube mondial spécialisé dans les marchés régionaux (Sénégal), analyse ce contexte : ${channelUrl}. 
      Génère un rapport de configuration SEO PROFESSIONNEL et COMPLET.
      Réponds au format JSON uniquement avec cette structure :
      {
        "niche": "Nom de la niche (ex: Politique & Lutte Lamb Sénégal)",
        "keywordCategories": [
          {"category": "Politique & Actualité", "keywords": [...]},
          {"category": "Lutte (Lamb)", "keywords": [...]},
          {"category": "Régional & Local", "keywords": [...]},
          {"category": "Marque & Identité", "keywords": [...]}
        ],
        "description": "Description optimisée 1000 chars",
        "targetAudience": "Audience cible",
        "uniqueValue": "Valeur unique",
        "strategicAdvice": ["conseil1", "conseil2"],
        "recommendedCountry": "Sénégal",
        "recommendedLanguage": "Français / Wolof",
        "seoStrength": 98,
        "algorithmChecks": {"indexability": true, "relevance": true, "authority": true},
        "roadmap": [
          {"step": "Immédiat", "action": "Mise à jour des tags de chaîne", "impact": "Indexation immédiate"},
          {"step": "Semaine 1", "action": "Optimisation de la bio", "impact": "Meilleur taux d'abonnement"},
          {"step": "Mois 1", "action": "Analyse des tendances Lamb", "impact": "Croissance virale"}
        ]
      }`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });
      
      const result = JSON.parse(response.text || '{}');
      setSeoResult(result);
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
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white sm:text-5xl tracking-tight">
          Configuration <span className="text-red-600">SEO Chaîne</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto text-lg">
          Obtenez les réglages exacts pour que YouTube comprenne votre niche et propulse vos vidéos.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-white dark:bg-[#1a1b20] p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 p-4 opacity-[0.03] rotate-12">
          <Youtube className="h-64 w-64" />
        </div>
        
        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-3 text-red-600 font-black text-sm uppercase tracking-[0.2em]">
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
                className="text-[10px] font-black text-red-600 hover:text-red-700 uppercase tracking-widest bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-lg transition-colors"
              >
                Exemple: Niche Sénégal 🇸🇳
              </button>
            </div>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Youtube className="h-6 w-6 text-red-500" />
                </div>
                <input
                  type="text"
                  value={channelUrl}
                  onChange={(e) => setChannelUrl(e.target.value)}
                  placeholder="Collez le lien de votre chaîne ici..."
                  className="block w-full pl-14 pr-6 py-5 bg-slate-50 dark:bg-[#0f1115] border-2 border-slate-100 dark:border-slate-800 rounded-[1.5rem] text-slate-900 dark:text-white placeholder-slate-400 focus:ring-4 focus:ring-red-500/20 focus:border-red-500 transition-all outline-none text-lg font-medium"
                />
              </div>
              <button
                onClick={handleGenerateSEO}
                disabled={isAnalyzing || !channelUrl}
                className="px-10 py-5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white font-black rounded-[1.5rem] transition-all shadow-xl shadow-red-600/30 flex items-center justify-center gap-3 text-lg group"
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
            {/* View Switcher */}
            <div className="flex justify-center">
              <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex gap-1">
                <button
                  onClick={() => setActiveView('strategy')}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-sm font-black transition-all",
                    activeView === 'strategy' 
                      ? "bg-white dark:bg-slate-700 text-red-600 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  STRATÉGIE SEO
                </button>
                <button
                  onClick={() => setActiveView('preview')}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-sm font-black transition-all",
                    activeView === 'preview' 
                      ? "bg-white dark:bg-slate-700 text-red-600 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  )}
                >
                  APERÇU YOUTUBE
                </button>
              </div>
            </div>

            {activeView === 'strategy' ? (
              <motion.div 
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8"
              >
                {/* Left Column: Keywords & Roadmap */}
                <div className="lg:col-span-8 space-y-8">
                  {/* Niche Detected Badge */}
                  <div className="bg-red-600 p-6 rounded-[2rem] shadow-lg text-white flex items-center justify-between">
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
                        <Hash className="h-6 w-6 text-red-500" />
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
                            <span className="text-red-600 font-black">{i + 1}</span>
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
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-3xl mx-auto bg-white dark:bg-[#1a1b20] rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden"
              >
                {/* YouTube Header Simulation */}
                <div className="h-32 bg-slate-100 dark:bg-slate-800 relative">
                  <div className="absolute -bottom-10 left-8 w-20 h-20 rounded-full bg-red-600 border-4 border-white dark:border-[#1a1b20] flex items-center justify-center">
                    <Youtube className="h-10 w-10 text-white" />
                  </div>
                </div>
                <div className="pt-12 p-8 space-y-6">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">Nom de votre chaîne</h2>
                    <p className="text-sm text-slate-500">@votrehandle • 125K abonnés • 450 vidéos</p>
                  </div>
                  
                  <div className="flex gap-4 border-b border-slate-100 dark:border-slate-800 pb-2">
                    {['Accueil', 'Vidéos', 'Playlists', 'À propos'].map((tab) => (
                      <span key={tab} className={cn(
                        "text-sm font-bold pb-2 px-1 cursor-default",
                        tab === 'À propos' ? "text-red-600 border-b-2 border-red-600" : "text-slate-500"
                      )}>
                        {tab}
                      </span>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-widest text-xs">Description</h3>
                    <div className="p-6 bg-slate-50 dark:bg-[#0f1115] rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                      {seoResult.description}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase">Détails</p>
                      <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                        <Globe className="h-4 w-4" />
                        Lieu : {seoResult.recommendedCountry}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
