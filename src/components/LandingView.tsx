import React from 'react';
import { Zap, Crown, Shield, Sparkles, ArrowRight, Bot } from 'lucide-react';

import { auth } from '../firebase';
import { signInWithPopup, GoogleAuthProvider, User as FirebaseUser } from 'firebase/auth';

export function LandingView({ setActiveTab, user }: { setActiveTab: (tab: string) => void, user: FirebaseUser | null }) {
  const handleGetStarted = async () => {
    if (user) {
      setActiveTab('dashboard');
    } else {
      const provider = new GoogleAuthProvider();
      try {
        await signInWithPopup(auth, provider);
        setActiveTab('dashboard');
      } catch (error) {
        console.error("Login error:", error);
        setActiveTab('pricing');
      }
    }
  };

  return (
    <div className="space-y-32 py-16">
      {/* Hero Section */}
      <section className="text-center space-y-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 rounded-full text-sm font-bold border border-indigo-200 dark:border-indigo-800">
          <Sparkles className="h-4 w-4" />
          Propulsé par l'IA de pointe
        </div>
        <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter text-slate-900 dark:text-white">
          Dominez <span className="text-red-600">YouTube</span> avec <br /> une précision chirurgicale.
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          TubeSEOPro transforme vos données brutes en stratégies de croissance concrètes. Optimisez, analysez et explosez vos vues avec notre suite d'outils professionnels.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <button 
            onClick={handleGetStarted}
            className="px-10 py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-all shadow-xl shadow-indigo-600/20 flex items-center gap-3 text-lg"
          >
            Commencer l'analyse <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="grid md:grid-cols-3 gap-8">
        {[
          { icon: Zap, title: 'SEO Intelligent', desc: 'Générez des titres et descriptions optimisés pour l\'algorithme en un clic.' },
          { icon: Crown, title: 'Analyses Pro', desc: 'Accédez à des données de marché exclusives pour devancer vos concurrents.' },
          { icon: Bot, title: 'Simulateur de Croissance', desc: 'Prévoyez l\'évolution de votre chaîne avec nos modèles de simulation IA.' }
        ].map((feature, i) => (
          <div key={i} className="p-10 bg-white dark:bg-[#1a1b20] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-none transition-transform hover:-translate-y-1 duration-300">
            <div className="h-16 w-16 rounded-2xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-8 border border-indigo-100 dark:border-indigo-800/50">
              <feature.icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{feature.title}</h3>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
