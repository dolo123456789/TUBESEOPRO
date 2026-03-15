import React, { ReactNode, useState } from 'react';
import { 
  BarChart2, 
  BarChart3,
  Search, 
  Video, 
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
  LogOut
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useProMode } from '../context/ProModeContext';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayoutProps {
  children: ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function Layout({ children, activeTab, setActiveTab }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { isPro, toggleProMode } = useProMode();

  const navigation = [
    { name: 'Accueil', id: 'landing', icon: BarChart2 },
    { name: 'Dashboard', id: 'dashboard', icon: BarChart2 },
    { name: 'Keyword Tool', id: 'keyword', icon: Search },
    { name: 'Video Analyzer', id: 'video', icon: Video },
    { name: 'Tag Generator', id: 'tags', icon: Tags },
    { name: 'Channel Audit', id: 'channel', icon: Users },
    { name: 'Trending Videos', id: 'trending', icon: TrendingUp },
    { name: 'Traffic Analyzer', id: 'traffic', icon: BarChart3 },
    { name: 'Growth Simulator', id: 'simulator', icon: Bot },
    { name: 'SEO Checklist', id: 'checklist', icon: ClipboardCheck },
    { name: 'Mon Profil', id: 'profile', icon: User },
    { name: 'Tarifs', id: 'pricing', icon: CreditCard },
    { name: 'FAQ', id: 'faq', icon: HelpCircle },
    { name: 'Policy', id: 'policy', icon: Shield },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0f1115] font-sans text-slate-900 dark:text-white overflow-hidden">
      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 transform bg-white dark:bg-[#0f1115] border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out lg:static lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-700 shadow-lg shadow-red-500/20">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">TubeSEO<span className="text-red-600">Pro</span></span>
          </div>
          <button 
            className="lg:hidden text-slate-500 hover:text-slate-700 dark:hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col h-[calc(100vh-64px)] justify-between py-6">
          <nav className="px-4 space-y-1 overflow-y-auto custom-scrollbar">
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
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group",
                    isActive 
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                      : "text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                  )}
                >
                  <Icon className={cn("h-5 w-5 transition-colors", isActive ? "text-white" : "text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white")} />
                  {item.name}
                </button>
              );
            })}
          </nav>

          <div className="px-4 mt-auto">
            <div className="rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-4 text-white shadow-xl shadow-indigo-600/20">
              <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-1">Current Plan</p>
              <p className="text-sm font-bold mb-3">{isPro ? 'Professional Plan' : 'Free Tier'}</p>
              {!isPro && (
                <button 
                  onClick={toggleProMode}
                  className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs font-bold py-2 rounded-lg transition-colors"
                >
                  Upgrade Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden relative">
        <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-900 pointer-events-none opacity-50" />
        
        <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-[#0f1115]/80 backdrop-blur-md px-4 lg:px-8 z-10">
          <button
            className="text-slate-500 hover:text-slate-700 lg:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex flex-1 justify-end">
            <div className="flex items-center gap-3">
              <div className="relative">
                <button 
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center gap-3 group text-left"
                >
                  <div className="text-right hidden sm:block">
                    <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1 group-hover:text-indigo-600 transition-colors">
                      Demo User
                    </p>
                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {isPro ? 'Pro Member' : 'Free Member'}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform overflow-hidden">
                    D
                  </div>
                </button>
                
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1a1b20] rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50">
                    <button onClick={() => {setActiveTab('profile'); setIsProfileMenuOpen(false);}} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors">
                      <User className="h-4 w-4" /> Mon Profil
                    </button>
                    <button onClick={() => {setActiveTab('pricing'); setIsProfileMenuOpen(false);}} className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors">
                      <CreditCard className="h-4 w-4" /> Tarifs
                    </button>
                    <div className="border-t border-slate-200 dark:border-slate-800 my-1"></div>
                    <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors">
                      <LogOut className="h-4 w-4" /> Déconnexion
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 z-0 animate-in fade-in duration-500">
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
