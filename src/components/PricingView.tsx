import React, { useState, useEffect } from 'react';
import { Check, Crown, Zap, Shield, Star, Sparkles, ArrowLeft, Loader2 } from 'lucide-react';
import { useProMode } from '../context/ProModeContext';
import { cn } from '../lib/utils';
import { auth } from '../firebase';
import { Toast } from './Toast';

export function PricingView({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const { isPro } = useProMode();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'error' | 'cancelled' | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('payment');
    if (status === 'success' || status === 'error' || status === 'cancelled') {
      setPaymentStatus(status as any);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const handlePayment = async (plan: any) => {
    if (!auth.currentUser) {
      setToast({ message: "Veuillez vous connecter pour passer à Pro.", type: 'error' });
      return;
    }

    setIsProcessing(true);
    setToast(null);
    try {
      const response = await fetch('/api/paytech/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': auth.currentUser.email || ''
        },
        body: JSON.stringify({
          email: auth.currentUser.email,
          planName: plan.name,
          amount: plan.amountXOF
        })
      });

      const data = await response.json();
      
      // Handle special case for free activation (amount 0)
      if (plan.amountXOF === 0 && data.success) {
        setToast({ message: "Accès Pro à vie activé avec succès !", type: 'success' });
        setTimeout(() => window.location.reload(), 2000);
        return;
      }

      if (data.redirect_url) {
        window.location.href = data.redirect_url;
      } else {
        const errorMsg = data.error || data.message || "Inconnu";
        const details = data.details ? ` (${JSON.stringify(data.details)})` : "";
        setToast({ message: `Erreur lors de l'initialisation du paiement: ${errorMsg}${details}`, type: 'error' });
      }
    } catch (error) {
      console.error("Payment error:", error);
      setToast({ message: "Une erreur est survenue lors de la connexion au service de paiement.", type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  const plans = [
    {
      name: 'Gratuit',
      price: '0 FCFA',
      amountXOF: 0,
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
      price: '15 000 FCFA',
      amountXOF: 15000,
      period: ' / 3 mois',
      description: 'Accès complet à toutes les fonctionnalités IA.',
      features: [
        'Recherche de mots-clés illimitée',
        'Données CPC & Tendances Pro',
        'Analyse de trafic approfondie',
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
      price: '65 000 FCFA',
      amountXOF: 65000,
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
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      {paymentStatus === 'success' && (
        <div className="bg-emerald-100 border border-emerald-200 text-emerald-800 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <Check className="h-6 w-6" />
          <p className="font-bold">Félicitations ! Votre paiement a été validé. Vous êtes maintenant membre Pro.</p>
        </div>
      )}
      {paymentStatus === 'error' && (
        <div className="bg-indigo-100 border border-indigo-200 text-indigo-800 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <Shield className="h-6 w-6" />
          <p className="font-bold">Désolé, une erreur est survenue lors de votre paiement. Veuillez réessayer.</p>
        </div>
      )}
      {paymentStatus === 'cancelled' && (
        <div className="bg-amber-100 border border-amber-200 text-amber-800 px-6 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
          <Zap className="h-6 w-6" />
          <p className="font-bold">Le paiement a été annulé. Vous pouvez réessayer quand vous le souhaitez.</p>
        </div>
      )}

      <button
        onClick={() => setActiveTab('dashboard')}
        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au tableau de bord
      </button>
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
          Choisissez le plan qui vous fera <span className="text-indigo-600">décoller</span>
        </h1>
        
        {auth.currentUser?.email && ['adamadiop709@gmail.com', 'adjisanoudolo1@gmail.com', 'infosportmedia7@gmail.com'].includes(auth.currentUser.email) && !isPro && (
          <div className="max-w-md mx-auto p-6 bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl shadow-xl border border-amber-400 animate-bounce">
            <h3 className="text-white font-black text-xl mb-2 flex items-center justify-center gap-2">
              <Crown className="h-6 w-6" />
              ACCÈS SPÉCIAL DÉTECTÉ
            </h3>
            <p className="text-amber-50 text-sm mb-4">
              En tant qu'utilisateur privilégié, vous pouvez activer votre accès Pro à vie gratuitement.
            </p>
            <button
              onClick={() => handlePayment({ name: 'Pro à Vie', amountXOF: 0 })}
              className="w-full py-3 bg-white text-amber-600 font-black rounded-xl hover:bg-amber-50 transition-colors shadow-lg"
            >
              ACTIVER PRO À VIE MAINTENANT
            </button>
          </div>
        )}

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
                    Puis 15 000 FCFA/mois après 3 mois
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
                onClick={() => {
                  if (plan.name === 'Enterprise') {
                    window.location.href = "mailto:adjisanoudolo1@gmail.com?subject=Demande d'accès TubeSEO Enterprise";
                  } else if (plan.name === 'Pro') {
                    handlePayment(plan);
                  }
                }}
                disabled={plan.name === 'Gratuit' || (plan.name === 'Pro' && isPro) || isProcessing}
                className={cn(
                  "w-full py-3 px-6 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2",
                  plan.highlight
                    ? "bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20"
                    : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white",
                  (plan.name === 'Gratuit' || (plan.name === 'Pro' && isPro) || isProcessing) && "opacity-50 cursor-not-allowed"
                )}
              >
                {isProcessing && plan.name === 'Pro' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  plan.buttonText
                )}
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
              <p className="text-sm text-slate-600 dark:text-slate-400">Automatisez votre recherche de mots-clés et votre optimisation SEO en quelques secondes.</p>
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
              <p className="text-sm text-indigo-700/70 dark:text-indigo-300/70">Transactions gérées par PayTech avec une sécurité de niveau bancaire (PCI DSS Compliant).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
