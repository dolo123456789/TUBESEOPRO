import React from 'react';
import { Crown, Lock, ArrowRight, Sparkles } from 'lucide-react';
import { useProMode } from '../context/ProModeContext';

interface ProGatedViewProps {
  children: React.ReactNode;
  title: string;
  description: string;
  setActiveTab: (tab: string) => void;
}

export function ProGatedView({ children, title, description, setActiveTab }: ProGatedViewProps) {
  const { isPro } = useProMode();

  if (isPro) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-[600px] flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-[#1a1b20] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl" />
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />

      <div className="relative z-10 max-w-md mx-auto">
        <div className="mb-8 relative inline-block">
          <div className="w-20 h-20 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto rotate-6 shadow-2xl shadow-indigo-500/40">
            <Crown className="h-10 w-10 text-white" />
          </div>
          <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-800">
            <Lock className="h-4 w-4 text-indigo-600" />
          </div>
        </div>

        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4 tracking-tight uppercase italic">
          Fonctionnalité <span className="text-indigo-600 dark:text-indigo-400">Exclusive Pro</span>
        </h2>
        
        <div className="space-y-4 mb-8">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{title}</h3>
          <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
            {description}
          </p>
        </div>

        <div className="grid gap-4 mb-8 text-left">
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
            <Sparkles className="h-5 w-5 text-amber-500 shrink-0" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Algorithmes IA de pointe</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
            <Sparkles className="h-5 w-5 text-indigo-500 shrink-0" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Données en temps réel</span>
          </div>
        </div>

        <button 
          onClick={() => setActiveTab('pricing')}
          className="group w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
        >
          DÉBLOQUER MAINTENANT
          <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="mt-6 text-xs font-bold text-slate-400 uppercase tracking-widest">
          Satisfait ou remboursé sous 7 jours
        </p>
      </div>
    </div>
  );
}
