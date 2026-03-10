/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { DashboardView } from './components/DashboardView';
import { KeywordToolView } from './components/KeywordToolView';
import { VideoAnalyzerView } from './components/VideoAnalyzerView';
import { TagGeneratorView } from './components/TagGeneratorView';
import { ChannelAuditView } from './components/ChannelAuditView';
import { TrendingVideosView } from './components/TrendingVideosView';
import { TrafficAnalyzerView } from './components/TrafficAnalyzerView';
import { GrowthSimulatorView } from './components/GrowthSimulatorView';
import { SEOChecklistView } from './components/SEOChecklistView';
import { ProfileView } from './components/ProfileView';
import { PricingView } from './components/PricingView';
import { LoginPage } from './components/LoginPage';
import { FAQPage } from './components/FAQPage';
import { PolicyPage } from './components/PolicyPage';
import { ThemeProvider } from './context/ThemeContext';
import { ProModeProvider } from './context/ProModeContext';
import { SearchProvider } from './context/SearchContext';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setIsInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0f1115] flex items-center justify-center">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ProModeProvider>
        {!isLoggedIn ? (
          <LoginPage onLogin={() => setIsLoggedIn(true)} />
        ) : (
          <SearchProvider>
            <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
              {activeTab === 'dashboard' && <DashboardView />}
              {activeTab === 'keyword' && <KeywordToolView />}
              {activeTab === 'video' && <VideoAnalyzerView />}
              {activeTab === 'tags' && <TagGeneratorView />}
              {activeTab === 'channel' && <ChannelAuditView />}
              {activeTab === 'trending' && <TrendingVideosView />}
              {activeTab === 'traffic' && <TrafficAnalyzerView />}
              {activeTab === 'simulator' && <GrowthSimulatorView />}
              {activeTab === 'checklist' && <SEOChecklistView />}
              {activeTab === 'profile' && <ProfileView />}
              {activeTab === 'pricing' && <PricingView />}
              {activeTab === 'faq' && <FAQPage />}
              {activeTab === 'policy' && <PolicyPage />}
            </Layout>
          </SearchProvider>
        )}
      </ProModeProvider>
    </ThemeProvider>
  );
}
