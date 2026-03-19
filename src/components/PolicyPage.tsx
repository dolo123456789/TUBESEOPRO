import React from 'react';
import { Shield } from 'lucide-react';

export function PolicyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-2">
          <Shield className="h-8 w-8 text-indigo-600" />
          Politique de Confidentialité
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Votre vie privée est notre priorité.</p>
      </div>
      <div className="bg-white dark:bg-[#1a1b20] p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Collecte de Données</h2>
        <p className="text-slate-600 dark:text-slate-300">Nous collectons le minimum de données nécessaires pour fournir nos services d'analyse SEO. Nous ne partageons pas vos informations personnelles avec des tiers.</p>
        
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Utilisation des Données</h2>
        <p className="text-slate-600 dark:text-slate-300">Les données sont utilisées exclusivement dans le but d'analyser les métadonnées de vos vidéos et de fournir des recommandations SEO.</p>
        
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Sécurité</h2>
        <p className="text-slate-600 dark:text-slate-300">Nous mettons en œuvre des mesures de sécurité conformes aux standards de l'industrie pour protéger vos données contre tout accès non autorisé.</p>
      </div>
    </div>
  );
}
