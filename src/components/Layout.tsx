import React, { ReactNode, useState, useEffect } from 'react';
import { 
  BarChart2, 
  BarChart3,
  Search, 
  Video, 
  Youtube,
  Tags, 
  TrendingUp, 
  Users,
  User,
  Menu,
  X,
  Crown,
  CreditCard,
  Sun,
  Moon,
  HelpCircle,
  Shield,
  Bot,
  ClipboardCheck,
  LogOut,
  Settings,
  LogIn,
  Gavel,
  ArrowRight
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useProMode } from '../context/ProModeContext';
import { auth } from '../firebase';
import { cn } from '../lib/utils';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { motion, AnimatePresence } from 'framer-motion';

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

import { Toast } from './Toast';

export function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const { isPro, toggleProMode } = useProMode();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
      if (e.key === 'Escape') {
        setIsCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsProfileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const navigation = [
    { name: 'Accueil', id: 'landing', icon: BarChart2 },
    { name: 'Dashboard', id: 'dashboard', icon: BarChart2 },
    { name: 'Keyword Tool', id: 'keyword', icon: Search },
    { name: 'Video Analyzer', id: 'video', icon: Video, pro: true },
    { name: 'Tag Generator', id: 'tags', icon: Tags },
    { name: 'Channel Audit', id: 'channel-seo', icon: Users },
    { name: 'Trending Videos', id: 'predictions', icon: TrendingUp, pro: true },
    { name: 'Traffic Analyzer', id: 'traffic', icon: BarChart3, pro: true },
    { name: 'Growth Simulator', id: 'simulator', icon: Bot, pro: true },
    { name: 'Checklist SEO', id: 'checklist', icon: ClipboardCheck },
    { name: 'Settings', id: 'settings', icon: Settings },
    { name: 'Profile', id: 'profile', icon: User },
    { name: 'Pricing', id: 'pricing', icon: CreditCard },
    { name: 'FAQ', id: 'faq', icon: HelpCircle },
    { name: 'Policy', id: 'policy', icon: Shield },
  ].filter(item => !item.pro || isPro);

  return (
    <>
      <div className="flex h-screen bg-white dark:bg-[#050505] font-sans text-slate-900 dark:text-white overflow-hidden texture-bg">
      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-72 transform glass border-r border-slate-100 dark:border-white/5 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] lg:static lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-24 items-center justify-between px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600 shadow-lg shadow-red-600/20">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">TubeSEO<span className="text-red-600">Pro</span></span>
          </div>
          <button 
            className="lg:hidden text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100vh-96px)] justify-between py-8">
          <nav className="px-6 space-y-2 overflow-y-auto custom-scrollbar">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-bold transition-all duration-300 group relative overflow-hidden",
                    isActive 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                      : "text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("h-5 w-5 transition-transform duration-300", isActive ? "scale-110" : "group-hover:scale-110")} />
                  <span className="uppercase tracking-widest text-[11px]">{item.name}</span>
                  {isActive && (
                    <motion.div 
                      layoutId="activeNav"
                      className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-full"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="px-6 mt-auto">
            <button 
              onClick={() => setActiveTab('pricing')}
              className="w-full text-left rounded-[2rem] bg-gradient-to-br from-indigo-600 to-indigo-700 p-6 text-white shadow-2xl relative overflow-hidden group transition-transform hover:scale-[1.02]"
            >
              <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 blur-2xl rounded-full group-hover:scale-150 transition-transform duration-700" />
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70 mb-2">CURRENT PLAN</p>
              <p className="text-lg font-black uppercase tracking-tight">{isPro ? 'Professional Plan' : 'Free Version'}</p>
              {!isPro && (
                <div className="mt-4 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest bg-white/20 w-fit px-3 py-1.5 rounded-lg">
                  Améliorer <ArrowRight className="h-3 w-3" />
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <header className="flex h-24 items-center justify-between border-b border-slate-100 dark:border-white/5 glass px-8 lg:px-12 z-30">
          <div className="flex items-center gap-4 flex-1">
            <button
              className="text-slate-400 hover:text-slate-900 dark:hover:text-white lg:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="h-7 w-7" />
            </button>
            
            <button 
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden md:flex items-center gap-3 px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all group w-full max-w-md"
            >
              <Search className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">Rechercher un outil...</span>
              <div className="ml-auto flex items-center gap-1 px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 rounded-md text-[10px] font-black">
                <span>⌘</span>
                <span>K</span>
              </div>
            </button>
          </div>
          
          <div className="flex flex-1 justify-end">
            <div className="flex items-center gap-6">
              {user ? (
                <div className="relative">
                  <button 
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="flex items-center gap-4 group"
                  >
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-indigo-600 transition-colors">
                        {user.displayName || 'Utilisateur'}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                        {isPro ? 'Elite Member' : 'Standard'}
                      </p>
                    </div>
                    <div className="relative">
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt="Profile" 
                          referrerPolicy="no-referrer"
                          className="h-12 w-12 rounded-2xl shadow-2xl group-hover:scale-105 transition-transform duration-500 object-cover border-2 border-transparent group-hover:border-indigo-600"
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-2xl bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-black font-black shadow-2xl group-hover:scale-105 transition-transform">
                          {user.displayName?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white dark:border-[#050505] rounded-full" />
                    </div>
                  </button>
                  
                  {isProfileMenuOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      className="absolute right-0 mt-4 w-64 bg-white dark:bg-[#111] rounded-[2rem] shadow-2xl border border-slate-100 dark:border-white/5 p-4 z-50"
                    >
                      <div className="px-4 py-3 mb-2">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Compte</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{user.email}</p>
                      </div>
                      <div className="space-y-1">
                        <button onClick={() => {setActiveTab('profile'); setIsProfileMenuOpen(false);}} className="w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl flex items-center gap-3 transition-all">
                          <User className="h-4 w-4" /> Profil
                        </button>
                        <button onClick={() => {setActiveTab('pricing'); setIsProfileMenuOpen(false);}} className="w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5 rounded-xl flex items-center gap-3 transition-all">
                          <Crown className="h-4 w-4" /> Améliorer
                        </button>
                        <div className="h-px bg-slate-100 dark:bg-white/5 my-2 mx-4"></div>
                        <button 
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-xl flex items-center gap-3 transition-all"
                        >
                          <LogOut className="h-4 w-4" /> Déconnexion
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <button 
                  onClick={handleLogin}
                  className="px-8 py-3.5 bg-slate-900 dark:bg-white text-white dark:text-black text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:scale-105 transition-all shadow-2xl"
                >
                  Connexion
                </button>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 lg:p-16 z-0">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-7xl"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
      
      {/* Command Palette */}
      <AnimatePresence>
        {isCommandPaletteOpen && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsCommandPaletteOpen(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="relative w-full max-w-2xl glass rounded-[2.5rem] shadow-2xl overflow-hidden border border-white/20"
            >
              <div className="p-6 border-b border-white/10 flex items-center gap-4">
                <Search className="h-6 w-6 text-indigo-500" />
                <input 
                  autoFocus
                  type="text" 
                  placeholder="Que cherchez-vous ?" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-bold placeholder:text-slate-500"
                />
                <div className="px-2 py-1 bg-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-400">ESC</div>
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto p-4 custom-scrollbar">
                <div className="space-y-1">
                  <p className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Outils & Navigation</p>
                  {navigation
                    .filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveTab(item.id);
                            setIsCommandPaletteOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-indigo-600 hover:text-white transition-all group"
                        >
                          <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl group-hover:bg-white/20 transition-colors">
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-black uppercase tracking-widest">{item.name}</p>
                            <p className="text-[10px] opacity-60 font-bold uppercase tracking-tight">Accéder à {item.name}</p>
                          </div>
                          <ArrowRight className="ml-auto h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                        </button>
                      );
                    })}
                </div>
                
                {searchQuery && (
                  <div className="mt-6 space-y-1">
                    <p className="px-4 py-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">Actions Rapides</p>
                    <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-red-600 hover:text-white transition-all group">
                      <div className="p-2 bg-red-500/10 rounded-xl group-hover:bg-white/20 transition-colors">
                        <Youtube className="h-5 w-5 text-red-600 group-hover:text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-black uppercase tracking-widest">Analyser "{searchQuery}"</p>
                        <p className="text-[10px] opacity-60 font-bold uppercase tracking-tight">Lancer une recherche SEO immédiate</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-slate-50 dark:bg-white/5 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                    <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 rounded">↑↓</span>
                    <span>Naviguer</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                    <span className="px-1.5 py-0.5 bg-slate-200 dark:bg-white/10 rounded">ENTER</span>
                    <span>Sélectionner</span>
                  </div>
                </div>
                <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">TubeSEO Pro v2.0</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Layout;
