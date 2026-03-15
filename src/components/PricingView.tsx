import React, { useState } from 'react';
import { Check, Crown, Zap, Shield, Star, Sparkles, ArrowLeft } from 'lucide-react';
import { useProMode } from '../context/ProModeContext';
import { cn } from './Layout';

export function PricingView({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { isPro } = useProMode();

  const plans = [
    {
      name: 'Gratuit',
      price: '0€',
      description: 'Pour les créateurs qui débutent sur YouTube.',
      features: [
        'Recherche de mots-clés (1/jour)',
        'Analyse SEO limitée',
        'Support communautaire'
      ],
      buttonText: 'Plan Actuel',
      highlight: false,
      icon: Zap,
      color: 'text-slate-500',
      bgColor: 'bg-slate-100 dark:bg-slate-800'
    },
    {
      name: 'Pro',
      price: '24€',
      period: ' / 3 mois',
      description: '24€ pour les 3 premiers mois, puis 24€/mois.',
      features: [
        'Recherche de mots-clés illimitée',
        'Données CPC & Tendances Pro',
        'Analyse de trafic approfondie',
        'Audit de chaîne concurrentielle',
        'Simulateur de croissance IA',
        'Stratégies "Magiques" personnalisées',
        'Analyse SEO A/B (Titres)',
        'Support prioritaire'
      ],
      buttonText: isPro ? 'Déjà Pro' : 'Passer à Pro',
      highlight: true,
      icon: Crown,
      color: 'text-amber-500',
      bgColor: 'bg-amber-100 dark:bg-amber-900/20'
    },
    {
      name: 'Enterprise',
      price: '99.9€',
      period: '/mois',
      description: 'Pour les agences et les réseaux de chaînes YouTube.',
      features: [
        'Tout le plan Pro',
        'Gestion multi-chaînes (jusqu\'à 10)',
        'Accès API complet',
        'Rapports marque blanche',
        'Consultant SEO dédié',
        'Analyses prédictives avancées'
      ],
      buttonText: 'Contacter la vente',
      highlight: false,
      icon: Shield,
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-100 dark:bg-indigo-900/20'
    }
  ];

  return (
    <div className="space-y-12 py-8">
      <button
        onClick={() => setActiveTab('dashboard')}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au tableau de bord
      </button>
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Choisissez le plan qui vous fera <span className="text-red-600">décoller</span>
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
          Des outils puissants pour chaque étape de votre aventure YouTube.
          Passez au niveau supérieur avec nos fonctionnalités IA avancées.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-bold border border-emerald-200 dark:border-emerald-800 animate-pulse">
          <Zap className="h-4 w-4" />
          Meilleur rapport qualité/prix du marché (-2% vs VidIQ/TubeBuddy)
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <div
              key={plan.name}
              className={cn(
                "relative flex flex-col p-8 rounded-3xl border transition-all duration-300",
                plan.highlight
                  ? "bg-white dark:bg-[#1a1b20] border-amber-500 shadow-xl scale-105 z-10"
                  : "bg-white dark:bg-[#1a1b20] border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md"
              )}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-500 text-white text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  RECOMMANDÉ
                </div>
              )}

              <div className="flex items-center gap-4 mb-6">
                <div className={cn("p-3 rounded-2xl", plan.bgColor)}>
                  <Icon className={cn("h-6 w-6", plan.color)} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{plan.name}</h3>
                  <p className="text-sm text-slate-500">{plan.description}</p>
                </div>
              </div>

              <div className="mb-8">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">{plan.price}</span>
                {plan.period && <span className="text-slate-500 ml-1">{plan.period}</span>}
                {plan.name === 'Pro' && (
                  <p className="text-xs text-amber-600 font-semibold mt-2 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded">
                    Puis 24€/mois après 3 mois
                  </p>
                )}
              </div>

              <ul className="flex-1 space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
                    <Check className="h-5 w-5 text-emerald-500 shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                onClick={async (e) => {
                  const btn = e.currentTarget;
                  const originalText = btn.innerText;
                  if (plan.name === 'Pro') {
                    try {
                      btn.innerText = 'Chargement...';
                      btn.disabled = true;
                      const response = await fetch('/api/create-checkout-session', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                      });
                      const data = await response.json();
                      if (data.url) {
                        window.location.href = data.url;
                      } else {
                        console.error('Payment error:', data.error);
                        alert('Erreur de paiement: ' + (data.error || 'Veuillez vérifier vos clés API Paydunya dans les paramètres.'));
                        btn.innerText = originalText;
                        btn.disabled = false;
                      }
                    } catch (error) {
                      console.error('Paydunya error:', error);
                      alert('Erreur de connexion au serveur de paiement.');
                      btn.innerText = originalText;
                      btn.disabled = false;
                    }
                  } else if (plan.name !== 'Gratuit') {
                    window.location.href = "mailto:adjisanoudolo1@gmail.com?subject=Demande d'accès TubeSEO Pro";
                  }
                }}
                disabled={plan.name === 'Gratuit' || (plan.name === 'Pro' && isPro)}
                className={cn(
                  "w-full py-3 px-6 rounded-xl font-bold transition-all duration-200",
                  plan.highlight
                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20"
                    : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white",
                  (plan.name === 'Gratuit' || (plan.name === 'Pro' && isPro)) && "opacity-50 cursor-not-allowed"
                )}
              >
                {plan.buttonText}
              </button>
            </div>
          );
        })}
      </div>

      {/* Comparison Section */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-[#1a1b20] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
            <Star className="h-6 w-6 text-yellow-500" />
            Pourquoi passer à TubeSEO Pro ?
          </h2>
          <div className="grid gap-8">
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white">Données en temps réel</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Accédez aux tendances actuelles via Google Search, pas des données datant de plusieurs mois.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white">IA de pointe</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Utilisez Gemini 3.1 pour des analyses SEO et des stratégies de croissance ultra-précises.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-white">Gain de temps massif</h4>
              <p className="text-sm text-slate-600 dark:text-slate-400">Automatisez votre recherche de mots-clés et votre audit de concurrence en quelques secondes.</p>
            </div>
          </div>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900/10 rounded-3xl border border-indigo-100 dark:border-indigo-800/50 p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-indigo-900 dark:text-indigo-100 mb-8 flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Sécurité & Confidentialité
          </h2>
          <div className="grid gap-8">
            <div className="space-y-2">
              <h4 className="font-bold text-indigo-900 dark:text-indigo-100">Protection des données</h4>
              <p className="text-sm text-indigo-700/70 dark:text-indigo-300/70">Vos données de chaîne sont chiffrées de bout en bout. Nous ne partageons jamais vos stratégies avec des tiers.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-indigo-900 dark:text-indigo-100">Conformité RGPD</h4>
              <p className="text-sm text-indigo-700/70 dark:text-indigo-300/70">Respect total de la vie privée et des régulations européennes sur la protection des données.</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-indigo-900 dark:text-indigo-100">Paiements Sécurisés</h4>
              <p className="text-sm text-indigo-700/70 dark:text-indigo-300/70">Transactions gérées par Paydunya avec une sécurité de niveau bancaire (PCI DSS Compliant).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
