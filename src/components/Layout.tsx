import React, { ReactNode, useState } from 'react';
import { 
  BarChart2, 
  BarChart3,
  Search, 
  Video, 
  Tags, 
  TrendingUp, 
  Users,
  Menu,
  X,
  Crown,
  CreditCard,
  Sun,
  Moon,
  HelpCircle,
  Shield,
  Bot,
  ClipboardCheck
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useProMode } from '../context/ProModeContext';
import { useTheme } from '../context/ThemeContext';

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
  const { isPro, toggleProMode } = useProMode();
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    { name: 'Dashboard', id: 'dashboard', icon: BarChart2 },
    { name: 'Keyword Tool', id: 'keyword', icon: Search },
    { name: 'Video Analyzer', id: 'video', icon: Video },
    { name: 'Tag Generator', id: 'tags', icon: Tags },
    { name: 'Channel Audit', id: 'channel', icon: Users },
    { name: 'Trending Videos', id: 'trending', icon: TrendingUp },
    { name: 'Traffic Analyzer', id: 'traffic', icon: BarChart3 },
    { name: 'Growth Simulator', id: 'simulator', icon: Bot },
    { name: 'SEO Checklist', id: 'checklist', icon: ClipboardCheck },
    { name: 'Tarifs', id: 'pricing', icon: CreditCard },
    { name: 'FAQ', id: 'faq', icon: HelpCircle },
    { name: 'Policy', id: 'policy', icon: Shield },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0f1115] font-sans text-slate-900 dark:text-white">
      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-30 w-64 transform bg-white dark:bg-[#1a1b20] border-r border-slate-200 dark:border-slate-800 transition duration-200 ease-in-out lg:static lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-black dark:text-white">TubeSEO<span className="text-red-600">Pro</span></span>
          </div>
          <button 
            className="lg:hidden text-slate-500 hover:text-slate-700"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-1">
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
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-indigo-700 dark:text-indigo-300" : "text-slate-400")} />
                {item.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b20] px-4 lg:px-8">
          <button
            className="text-slate-500 hover:text-slate-700 lg:hidden"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex flex-1 justify-end">
            <div className="flex items-center gap-4">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
              <button
                onClick={toggleProMode}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors border",
                  isPro 
                    ? "bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800 hover:bg-amber-200 dark:hover:bg-amber-900/40" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700"
                )}
              >
                <Crown className={cn("h-4 w-4", isPro ? "text-amber-500" : "text-slate-400")} />
                {isPro ? 'Pro Active' : 'Upgrade to Pro'}
              </button>
              <div className="hidden sm:flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                API Connected
              </div>
              <div className="h-8 w-8 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-700 dark:text-indigo-300 font-medium">
                U
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
