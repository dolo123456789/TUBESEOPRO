import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ClipboardCheck, Info, Lightbulb, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

interface ChecklistItem {
  id: string;
  category: string;
  text: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: 'keyword-title',
    category: 'Titre',
    text: 'Mot-clé principal au début du titre',
    description: 'Placez votre mot-clé le plus important dans les 60 premiers caractères.',
    priority: 'high'
  },
  {
    id: 'ctr-title',
    category: 'Titre',
    text: 'Titre incitatif (Curiosité ou Bénéfice)',
    description: 'Le titre doit donner envie de cliquer sans être du clickbait mensonger.',
    priority: 'high'
  },
  {
    id: 'thumbnail-text',
    category: 'Miniature',
    text: 'Texte lisible sur mobile',
    description: 'Utilisez des polices grasses et contrastées. Moins de 4-5 mots.',
    priority: 'high'
  },
  {
    id: 'thumbnail-face',
    category: 'Miniature',
    text: 'Visage expressif ou visuel fort',
    description: 'Les visages avec des émotions claires augmentent souvent le CTR.',
    priority: 'medium'
  },
  {
    id: 'desc-first-lines',
    category: 'Description',
    text: '2 premières lignes optimisées',
    description: 'Ces lignes apparaissent dans les résultats de recherche. Incluez vos mots-clés.',
    priority: 'high'
  },
  {
    id: 'desc-links',
    category: 'Description',
    text: 'Liens et appels à l\'action',
    description: 'Ajoutez des liens vers vos réseaux ou produits après le premier paragraphe.',
    priority: 'medium'
  },
  {
    id: 'chapters',
    category: 'Engagement',
    text: 'Chapitres (Timestamps)',
    description: 'Aide à la rétention et au SEO Google. Format 00:00 - Titre.',
    priority: 'medium'
  },
  {
    id: 'cards-end-screens',
    category: 'Engagement',
    text: 'Fiches et Écrans de fin',
    description: 'Redirigez vers une autre vidéo pour augmenter la durée de session.',
    priority: 'high'
  },
  {
    id: 'comment-pin',
    category: 'Engagement',
    text: 'Commentaire épinglé avec question',
    description: 'Posez une question pour encourager les commentaires dès le début.',
    priority: 'low'
  },
  {
    id: 'tags-specific',
    category: 'Tags',
    text: 'Tags spécifiques et larges',
    description: 'Utilisez un mélange de tags précis et de catégories plus larges.',
    priority: 'low'
  }
];

export function SEOChecklistView() {
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('tubeseo_checklist');
    if (saved) {
      setCheckedItems(JSON.parse(saved));
    }
  }, []);

  const toggleItem = (id: string) => {
    const newChecked = checkedItems.includes(id)
      ? checkedItems.filter(i => i !== id)
      : [...checkedItems, id];
    
    setCheckedItems(newChecked);
    localStorage.setItem('tubeseo_checklist', JSON.stringify(newChecked));
  };

  const progress = Math.round((checkedItems.length / CHECKLIST_ITEMS.length) * 100);

  const categories = Array.from(new Set(CHECKLIST_ITEMS.map(item => item.category)));

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mb-4">
          <ClipboardCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Checklist SEO Ultime</h1>
        <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">
          Assurez-vous que chaque vidéo est parfaitement optimisée avant de la publier.
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-[#1a1b20] rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Progression de l'optimisation</span>
          <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{progress}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="bg-emerald-500 h-3 rounded-full"
          />
        </div>
        {progress === 100 && (
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center text-emerald-600 dark:text-emerald-400 font-medium flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="h-5 w-5" />
            Votre vidéo est prête pour le succès !
          </motion.p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          {categories.map(category => (
            <div key={category} className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white border-l-4 border-indigo-500 pl-4">
                {category}
              </h2>
              <div className="space-y-3">
                {CHECKLIST_ITEMS.filter(item => item.category === category).map(item => (
                  <div 
                    key={item.id}
                    onClick={() => toggleItem(item.id)}
                    className={`group cursor-pointer flex items-start gap-4 p-4 rounded-xl border transition-all ${
                      checkedItems.includes(item.id)
                        ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/50'
                        : 'bg-white dark:bg-[#1a1b20] border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700'
                    }`}
                  >
                    <div className="mt-1">
                      {checkedItems.includes(item.id) ? (
                        <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                      ) : (
                        <Circle className="h-6 w-6 text-slate-300 dark:text-slate-700 group-hover:text-indigo-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className={`font-semibold ${checkedItems.includes(item.id) ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>
                          {item.text}
                        </h3>
                        {item.priority === 'high' && !checkedItems.includes(item.id) && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 uppercase">
                            Crucial
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        {item.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-800/50">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold mb-4">
              <Lightbulb className="h-5 w-5" />
              Conseil Pro
            </div>
            <p className="text-sm text-indigo-800 dark:text-indigo-400 leading-relaxed">
              Le SEO n'est qu'une partie de l'équation. La <strong>rétention</strong> (combien de temps les gens regardent) est le facteur #1 pour que l'algorithme recommande votre vidéo.
            </p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-6 border border-amber-100 dark:border-amber-800/50">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold mb-4">
              <AlertTriangle className="h-5 w-5" />
              Erreur à éviter
            </div>
            <p className="text-sm text-amber-800 dark:text-amber-400 leading-relaxed">
              Ne changez pas vos métadonnées trop souvent. Laissez à l'algorithme 24-48h pour indexer vos changements avant d'analyser les résultats.
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold mb-4">
              <Info className="h-5 w-5" />
              À propos
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Cette checklist est basée sur les meilleures pratiques actuelles de YouTube (2024-2025). Elle est 100% fiable et ne nécessite pas de connexion IA.
            </p>
            <button 
              onClick={() => {
                setCheckedItems([]);
                localStorage.removeItem('tubeseo_checklist');
              }}
              className="mt-6 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors underline underline-offset-4"
            >
              Réinitialiser la checklist
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
