import React from 'react';
import { HelpCircle } from 'lucide-react';

export function FAQPage() {
  const faqs = [
    {
      question: "Comment fonctionne TubeSEO Pro ?",
      answer: "TubeSEO Pro utilise des modèles d'IA avancés pour analyser les métadonnées de vos vidéos et les comparer aux tendances YouTube en temps réel afin de fournir des conseils SEO exploitables."
    },
    {
      question: "Est-ce gratuit ?",
      answer: "Nous proposons une version gratuite avec des fonctionnalités d'analyse de base. Pour les fonctionnalités avancées comme les tests A/B et les audits de chaînes concurrentes, nous proposons un abonnement Pro."
    },
    {
      question: "Puis-je annuler mon abonnement ?",
      answer: "Oui, vous pouvez annuler votre abonnement à tout moment depuis les paramètres de votre compte."
    }
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-2">
          <HelpCircle className="h-8 w-8 text-indigo-600" />
          Foire Aux Questions (FAQ)
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Tout ce que vous devez savoir sur TubeSEO Pro.</p>
      </div>
      <div className="space-y-4">
        {faqs.map((faq, i) => (
          <div key={i} className="bg-white dark:bg-[#1a1b20] p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{faq.question}</h3>
            <p className="text-slate-600 dark:text-slate-300">{faq.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
