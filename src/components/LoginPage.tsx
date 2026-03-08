import React, { useState } from 'react';
import { Mail, Lock, Sparkles, TrendingUp, Zap, ShieldCheck, Star, MessageCircle } from 'lucide-react';
import { PricingView } from './PricingView';

export function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentLang, setCurrentLang] = useState('FR');

  const languages = [
    { code: 'FR', name: 'Français', flag: '🇫🇷' },
    { code: 'EN', name: 'English', flag: '🇺🇸' },
    { code: 'ES', name: 'Español', flag: '🇪🇸' },
    { code: 'DE', name: 'Deutsch', flag: '🇩🇪' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] p-4 font-sans overflow-y-auto relative">
      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest hidden sm:block">
          Langue
        </span>
        <div className="flex items-center gap-1.5 bg-white/80 dark:bg-[#1a1b20]/80 backdrop-blur-md p-1.5 rounded-full shadow-xl border border-slate-200 dark:border-slate-800">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setCurrentLang(lang.code)}
              className={`group relative flex items-center justify-center w-10 h-10 rounded-full transition-all duration-300 ${
                currentLang === lang.code 
                  ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-500/30' 
                  : 'hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-400'
              }`}
            >
              <span className="text-xl transform group-hover:scale-125 transition-transform">{lang.flag}</span>
              
              {/* Tooltip */}
              <span className="absolute -bottom-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-800 text-white text-[10px] rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                {lang.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-12 py-8">
        <div className="w-full bg-white dark:bg-[#1a1b20] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-slate-200 dark:border-slate-800">
          {/* Left Side: Advertisement/Promo */}
          <div className="w-full lg:w-[55%] bg-gradient-to-br from-indigo-600 via-indigo-700 to-blue-800 p-8 lg:p-12 flex flex-col justify-between text-white relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl"></div>
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8 border border-white/30">
                <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                Offre Spéciale : -50% sur le Plan Pro
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-black mb-6 leading-tight tracking-tight">
                Dominez YouTube avec <span className="text-yellow-300">TubeSEO Pro</span>
              </h2>
              <p className="text-indigo-100 text-lg mb-8 leading-relaxed max-w-md">
                L'outil n°1 pour les créateurs qui veulent transformer leurs vidéos en machines à vues grâce à l'intelligence artificielle.
              </p>

              <div className="grid grid-cols-1 gap-8 mb-8">
                <div className="space-y-4">
                  <div className="flex items-start gap-4 group">
                    <div className="bg-white/10 p-3 rounded-xl group-hover:bg-white/20 transition-all transform group-hover:scale-110">
                      <TrendingUp className="h-6 w-6 text-yellow-300" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">Analyse Virale</h4>
                      <p className="text-sm text-indigo-200">Opportunités détectées par IA en temps réel.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 group">
                    <div className="bg-white/10 p-3 rounded-xl group-hover:bg-white/20 transition-all transform group-hover:scale-110">
                      <Zap className="h-6 w-6 text-yellow-300" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">SEO Automatisé</h4>
                      <p className="text-sm text-indigo-200">Optimisation des titres et tags pour un CTR maximal.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 group">
                    <div className="bg-white/10 p-3 rounded-xl group-hover:bg-white/20 transition-all transform group-hover:scale-110">
                      <ShieldCheck className="h-6 w-6 text-yellow-300" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-base">Audit Concurrent</h4>
                      <p className="text-sm text-indigo-200">Décryptez les stratégies de vos rivaux.</p>
                    </div>
                  </div>
                </div>

                {/* High-Impact Banner Image */}
                <div className="relative group rounded-3xl overflow-hidden border border-white/20 shadow-2xl aspect-[16/9] bg-slate-900">
                  <img 
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" 
                    alt="YouTube SEO Dashboard" 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/90 via-indigo-900/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                          <img 
                            key={i}
                            src={`https://picsum.photos/seed/banner-user-${i}/100/100`} 
                            className="w-8 h-8 rounded-full border-2 border-indigo-600 object-cover"
                            alt="User"
                            referrerPolicy="no-referrer"
                          />
                        ))}
                      </div>
                      <span className="text-xs font-bold text-white/90">+5k créateurs actifs ce mois-ci</span>
                    </div>
                    <h3 className="text-xl font-black text-white">Boostez votre visibilité maintenant</h3>
                  </div>
                </div>
              </div>

              {/* Testimonial Mini */}
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10 mb-6">
                <p className="text-xs italic text-indigo-100 mb-2">
                  "J'ai doublé mes abonnés en 3 mois grâce à TubeSEO Pro !"
                </p>
                <div className="flex items-center gap-2">
                  <img src="https://picsum.photos/seed/creator/100/100" className="w-6 h-6 rounded-full border border-white/20" alt="Testimonial" referrerPolicy="no-referrer" />
                  <p className="text-[10px] font-bold">Marc Tech <span className="font-normal text-indigo-300 ml-1">(250k abonnés)</span></p>
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-4 pt-6 border-t border-white/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <img 
                        key={i}
                        src={`https://picsum.photos/seed/user${i}/100/100`} 
                        className="w-8 h-8 rounded-full border-2 border-indigo-700 object-cover"
                        alt="User"
                        referrerPolicy="no-referrer"
                      />
                    ))}
                  </div>
                  <div className="text-xs text-indigo-100">
                    <div className="flex text-yellow-300 mb-0.5">
                      {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-3 w-3 fill-current" />)}
                    </div>
                    Rejoint par +12,000 créateurs
                  </div>
                </div>

                {/* Trusted By Mini */}
                <div className="flex items-center gap-4 opacity-40 grayscale contrast-200">
                  <span className="text-[10px] font-black tracking-tighter">CREATOR_HUB</span>
                  <span className="text-[10px] font-black tracking-tighter">VID_ACADEMY</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Login Form */}
          <div className="w-full lg:w-[45%] p-8 lg:p-16 flex flex-col justify-center">
            <div className="max-w-md mx-auto w-full">
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Bon retour parmi nous</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-10">Connectez-vous pour accéder à vos outils de croissance.</p>
              
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onLogin(); }}>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Adresse Email</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="votre@email.com"
                      required
                    />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Mot de passe</label>
                    <a href="#" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">Oublié ?</a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>
                <button 
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold text-lg hover:bg-indigo-700 transform hover:-translate-y-0.5 transition-all shadow-lg shadow-indigo-500/20 active:scale-[0.98]"
                >
                  Se Connecter
                </button>
              </form>
              
              <div className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Pas encore de compte ? <a href="#" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">Créer un compte gratuitement</a>
                </p>
                
                <button 
                  onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-sm text-slate-400 hover:text-indigo-500 transition-colors font-medium mb-6 flex items-center justify-center gap-1 mx-auto"
                >
                  <Star className="h-3.5 w-3.5" />
                  Voir nos tarifs et avantages Pro
                </button>

                <div className="space-y-4">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Contacter la Vente</p>
                  <div className="flex gap-3">
                    <a 
                      href="mailto:adjisanoudolo1@gmail.com"
                      className="flex-1 flex items-center justify-center gap-2 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-slate-300 py-3 px-4 rounded-xl font-bold text-xs hover:bg-slate-100 dark:hover:bg-white/10 transition-all border border-slate-200 dark:border-white/10"
                    >
                      <Mail className="h-3.5 w-3.5" />
                      Email
                    </a>
                    <a 
                      href="https://wa.me/777616080"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 py-3 px-4 rounded-xl font-bold text-xs hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Section */}
        <div id="pricing-section" className="bg-white dark:bg-[#1a1b20] rounded-[2rem] shadow-2xl p-8 lg:p-12 border border-slate-200 dark:border-slate-800">
          <PricingView />
        </div>
      </div>
    </div>
  );
}
