import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  TrendingUp, 
  AlertCircle, 
  Calendar, 
  Users, 
  Target, 
  Zap, 
  Share2, 
  Copy, 
  CheckCircle2,
  RefreshCw,
  Search,
  Flag,
  MessageSquare,
  BarChart3,
  Gavel
} from 'lucide-react';
import { fetchPoliticalPredictions } from '../services/geminiService';

interface Prediction {
  title: string;
  description: string;
  probability: number;
  impact_score: number;
  key_actors: string[];
  recommended_video_title: string;
  thumbnail_idea: string;
  hashtags: string[];
}

const PredictionCard = React.memo(({ prediction }: { prediction: Prediction }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white dark:bg-[#1a1b20] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all duration-300 group">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-full text-xs font-bold uppercase tracking-wider">
            <Zap className="h-3 w-3" />
            Prédiction Choc
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Probabilité</p>
              <p className="text-lg font-black text-indigo-600 dark:text-indigo-400">{prediction.probability}%</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Impact</p>
              <p className="text-lg font-black text-amber-500">{prediction.impact_score}/100</p>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 group-hover:text-indigo-600 transition-colors">
          {prediction.title}
        </h3>
        
        <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6">
          {prediction.description}
        </p>

        <div className="space-y-4">
          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-1">
              <Users className="h-3 w-3" /> Acteurs Clés
            </p>
            <div className="flex flex-wrap gap-2">
              {prediction.key_actors.map((actor, idx) => (
                <span key={idx} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md text-xs font-medium">
                  {actor}
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] text-indigo-600 dark:text-indigo-400 uppercase font-bold tracking-widest flex items-center gap-1">
                <Target className="h-3 w-3" /> Titre YouTube Recommandé
              </p>
              <button 
                onClick={() => handleCopy(prediction.recommended_video_title)}
                className="text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-white italic">
              "{prediction.recommended_video_title}"
            </p>
          </div>

          <div>
            <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-2 flex items-center gap-1">
              <BarChart3 className="h-3 w-3" /> Idée de Miniature
            </p>
            <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-dashed border-slate-200 dark:border-slate-700">
              {prediction.thumbnail_idea}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {prediction.hashtags.map((tag, idx) => (
              <span key={idx} className="text-xs font-bold text-indigo-500 hover:text-indigo-600 cursor-pointer">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
});

const SkeletonCard = () => (
  <div className="bg-white dark:bg-[#1a1b20] rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-pulse">
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <div className="h-6 w-24 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
        <div className="h-6 w-16 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
      </div>
      <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg mb-4"></div>
      <div className="space-y-2 mb-6">
        <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded"></div>
        <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded"></div>
      </div>
      <div className="h-24 w-full bg-slate-100 dark:bg-slate-800/50 rounded-xl"></div>
    </div>
  </div>
);

export function PoliticalPredictionsView() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPredictions = useCallback(async (forceRefresh: boolean = false) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPoliticalPredictions(forceRefresh);
      setPredictions(data);
    } catch (err) {
      console.error('Error loading predictions:', err);
      setError('Impossible de charger les prédictions politiques. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPredictions();
  }, [loadPredictions]);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="max-w-2xl">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-2">
            <Gavel className="h-5 w-5" />
            <span>Analyse Stratégique Sénégal</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white mb-4">
            Prédictions <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-amber-500">Politiques Sénégal</span>
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400">
            Anticipez les prochains séismes politiques au Sénégal pour créer du contenu viral. Analyses basées sur les tendances actuelles et les rapports de force.
          </p>
        </div>
        
        <button 
          onClick={() => loadPredictions(true)}
          disabled={isLoading}
          className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-6 py-3 rounded-xl font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm disabled:opacity-50"
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
          Actualiser les Analyses
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 p-6 rounded-2xl flex items-center gap-4 text-red-700 dark:text-red-400">
          <AlertCircle className="h-6 w-6 flex-shrink-0" />
          <p className="font-medium">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
        ) : (
          predictions.map((prediction, idx) => (
            <PredictionCard key={idx} prediction={prediction} />
          ))
        )}
      </div>

      {!isLoading && predictions.length === 0 && !error && (
        <div className="text-center py-20 bg-white dark:bg-[#1a1b20] rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
          <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Search className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Aucune prédiction disponible</h3>
          <p className="text-slate-500 dark:text-slate-400">Essayez d'actualiser la page pour générer de nouvelles analyses.</p>
        </div>
      )}

      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <TrendingUp className="h-32 w-32" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Zap className="h-6 w-6 text-amber-400" />
            Conseil Stratégique pour votre Chaîne
          </h2>
          <p className="text-indigo-100 mb-6 leading-relaxed">
            Utilisez ces prédictions pour créer des vidéos de type "Breaking News" ou "Analyse Profonde". Les titres recommandés sont optimisés pour susciter la curiosité et le débat dans les commentaires, ce qui booste l'algorithme YouTube.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
              <MessageSquare className="h-4 w-4 text-indigo-300" />
              <span className="text-sm font-medium">Posez des questions à l'audience</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-lg border border-white/10">
              <Flag className="h-4 w-4 text-indigo-300" />
              <span className="text-sm font-medium">Utilisez des miniatures contrastées</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
