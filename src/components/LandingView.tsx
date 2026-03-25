import React from 'react';
import { Zap, Crown, Shield, Sparkles, ArrowRight, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../lib/utils';

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
    <div className="space-y-40 py-24 overflow-hidden">
      {/* Hero Section - Editorial Recipe */}
      <section className="relative text-center space-y-12 px-4">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full -z-10" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-6 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-full text-xs font-black uppercase tracking-widest border border-indigo-100 dark:border-indigo-900/30 shadow-xl shadow-indigo-500/5"
        >
          <Sparkles className="h-3 w-3" />
          Propulsé par l'IA de pointe
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-6xl md:text-[8rem] font-black tracking-tighter text-slate-900 dark:text-white leading-[0.9] max-w-5xl mx-auto"
        >
          Dominez <span className="text-red-600">YouTube</span> avec une précision chirurgicale.
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium"
        >
          TubeSEOPro transforme vos données brutes en stratégies de croissance chirurgicales. Optimisez, analysez et explosez vos vues avec l'IA.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-8"
        >
          <button 
            onClick={handleGetStarted}
            className="group px-12 py-6 bg-gradient-to-br from-indigo-600 to-indigo-700 hover:scale-105 text-white font-black rounded-[2rem] transition-all shadow-2xl shadow-indigo-600/40 flex items-center gap-4 text-xl uppercase tracking-widest"
          >
            Commencer l'analyse 
            <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
          </button>
          
          <div className="flex -space-x-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="w-12 h-12 rounded-full border-4 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 overflow-hidden shadow-lg">
                <img src={`https://picsum.photos/seed/user${i}/100/100`} alt="User" className="w-full h-full object-cover" />
              </div>
            ))}
            <div className="pl-6 flex flex-col items-start justify-center">
              <span className="text-sm font-black text-slate-900 dark:text-white">+10k Créateurs</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Utilisent TubeSEOPro</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid - Brutalist/Modern Recipe */}
      <section className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-1">
        {[
          { icon: Zap, title: 'SEO Intelligent', desc: 'Générez des titres et descriptions optimisés pour l\'algorithme en un clic.', color: 'text-indigo-600' },
          { icon: Crown, title: 'Analyses Pro', desc: 'Accédez à des données de marché exclusives pour devancer vos concurrents.', color: 'text-indigo-600' },
          { icon: Bot, title: 'Simulateur IA', desc: 'Prévoyez l\'évolution de votre chaîne avec nos modèles de simulation IA.', color: 'text-indigo-600' }
        ].map((feature, i) => (
          <div key={i} className="group p-12 bg-white dark:bg-[#1a1b20] border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all duration-500">
            <div className="h-16 w-16 rounded-2xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center mb-10 border border-slate-100 dark:border-slate-800 group-hover:scale-110 group-hover:rotate-6 transition-all">
              <feature.icon className={cn("h-8 w-8", feature.color)} />
            </div>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-6 uppercase tracking-tight">{feature.title}</h3>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-lg font-medium">{feature.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
