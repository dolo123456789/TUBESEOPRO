/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
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
import { PricingView } from './components/PricingView';
import { LoginPage } from './components/LoginPage';
import { FAQPage } from './components/FAQPage';
import { PolicyPage } from './components/PolicyPage';
import { ThemeProvider } from './context/ThemeContext';
import { ProModeProvider } from './context/ProModeContext';
import { SearchProvider } from './context/SearchContext';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (!isLoggedIn) {
    return (
      <ThemeProvider>
        <ProModeProvider>
          <LoginPage onLogin={() => setIsLoggedIn(true)} />
        </ProModeProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <ProModeProvider>
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
            {activeTab === 'pricing' && <PricingView />}
            {activeTab === 'faq' && <FAQPage />}
            {activeTab === 'policy' && <PolicyPage />}
          </Layout>
        </SearchProvider>
      </ProModeProvider>
    </ThemeProvider>
  );
}
