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
  keywords: string[];
  description: string;
  targetAudience: string;
  uniqueValue: string;
  strategicAdvice: string[];
  recommendedCountry: string;
  recommendedLanguage: string;
  seoStrength: number;
}

export function ChannelSEOView() {
  const [channelUrl, setChannelUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [seoResult, setSeoResult] = useState<SEOResult | null>(null);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleGenerateSEO = async () => {
    if (!channelUrl) return;
    setIsAnalyzing(true);
    try {
      const prompt = `En tant qu'expert SEO YouTube mondial spécialisé dans les marchés régionaux, analyse ce contexte : ${channelUrl}. 
      Génère un rapport de configuration SEO PROFESSIONNEL.
      Réponds au format JSON uniquement avec cette structure :
      {
        "niche": "Nom de la niche",
        "keywords": ["tag1", "tag2", ...],
        "description": "Description optimisée",
        "targetAudience": "Audience cible",
        "uniqueValue": "Valeur unique",
        "strategicAdvice": ["conseil1", "conseil2"],
        "recommendedCountry": "Pays recommandé (ex: Sénégal)",
        "recommendedLanguage": "Langue recommandée (ex: Français / Wolof)",
        "seoStrength": 95
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
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Left Column: Keywords & Description */}
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

              {/* Keywords Card */}
              <div className="bg-white dark:bg-[#1a1b20] p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                      <Hash className="h-6 w-6 text-red-500" />
                      Mots-clés de Chaîne
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">À copier dans Paramètres &gt; Chaîne</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(seoResult.keywords.join(', '), 'keywords')}
                    className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:opacity-90 transition-all text-sm font-black uppercase tracking-wider"
                  >
                    {copiedSection === 'keywords' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copiedSection === 'keywords' ? 'Copié' : 'Copier tout'}
                  </button>
                </div>

                <div className="flex flex-wrap gap-3">
                  {seoResult.keywords.map((keyword, idx) => (
                    <span
                      key={idx}
                      className="px-4 py-2 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/50 rounded-xl text-sm font-bold text-red-700 dark:text-red-400 flex items-center gap-2"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              {/* Description Card */}
              <div className="bg-white dark:bg-[#1a1b20] p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
                    <FileText className="h-6 w-6 text-indigo-500" />
                    Description Optimisée
                  </h2>
                  <button
                    onClick={() => copyToClipboard(seoResult.description, 'desc')}
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-slate-200 transition-all"
                    title="Copier la description"
                  >
                    {copiedSection === 'desc' ? <CheckCircle2 className="h-5 w-5 text-emerald-500" /> : <Copy className="h-5 w-5" />}
                  </button>
                </div>
                <div className="p-6 bg-slate-50 dark:bg-[#0f1115] rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                  {seoResult.description}
                </div>
              </div>
            </div>

            {/* Right Column: Strategic Analysis */}
            <div className="lg:col-span-4 space-y-8">
              {/* SEO Strength Indicator */}
              <div className="bg-white dark:bg-[#1a1b20] p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Force SEO</h3>
                  <span className="text-2xl font-black text-emerald-500">{seoResult.seoStrength}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${seoResult.seoStrength}%` }}
                    className="h-full bg-emerald-500"
                  />
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

              {/* Strategic Advice */}
              <div className="bg-white dark:bg-[#1a1b20] p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-500" />
                  Conseils Stratégiques
                </h3>
                <div className="space-y-4">
                  {seoResult.strategicAdvice.map((advice, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="mt-1.5 w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{advice}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Checklist */}
              <div className="p-6 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800/30 rounded-[2rem]">
                <h4 className="font-black text-red-900 dark:text-red-300 text-sm uppercase mb-4">Action Immédiate</h4>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-xs font-bold text-red-700 dark:text-red-400">
                    <div className="w-5 h-5 rounded-lg bg-red-600 text-white flex items-center justify-center text-[10px]">1</div>
                    Coller les mots-clés
                  </li>
                  <li className="flex items-center gap-3 text-xs font-bold text-red-700 dark:text-red-400">
                    <div className="w-5 h-5 rounded-lg bg-red-600 text-white flex items-center justify-center text-[10px]">2</div>
                    Mettre à jour la description
                  </li>
                  <li className="flex items-center gap-3 text-xs font-bold text-red-700 dark:text-red-400">
                    <div className="w-5 h-5 rounded-lg bg-red-600 text-white flex items-center justify-center text-[10px]">3</div>
                    Vérifier le pays de résidence
                  </li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
