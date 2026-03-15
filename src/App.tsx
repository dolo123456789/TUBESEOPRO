/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { LandingView } from './components/LandingView';
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
import { FAQPage } from './components/FAQPage';
import { PolicyPage } from './components/PolicyPage';
import { SettingsView } from './components/SettingsView';
import { ThemeProvider } from './context/ThemeContext';
import { ProModeProvider } from './context/ProModeContext';
import { SearchProvider } from './context/SearchContext';

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');

  return (
    <ThemeProvider>
      <ProModeProvider>
        <SearchProvider>
          <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
            {activeTab === 'landing' && <LandingView setActiveTab={setActiveTab} />}
            {activeTab === 'dashboard' && <DashboardView setActiveTab={setActiveTab} />}
            {activeTab === 'keyword' && <KeywordToolView />}
            {activeTab === 'video' && <VideoAnalyzerView />}
            {activeTab === 'tags' && <TagGeneratorView />}
            {activeTab === 'channel' && <ChannelAuditView />}
            {activeTab === 'trending' && <TrendingVideosView />}
            {activeTab === 'traffic' && <TrafficAnalyzerView />}
            {activeTab === 'simulator' && <GrowthSimulatorView />}
            {activeTab === 'checklist' && <SEOChecklistView />}
            {activeTab === 'profile' && <ProfileView />}
            {activeTab === 'pricing' && <PricingView setActiveTab={setActiveTab} />}
            {activeTab === 'faq' && <FAQPage />}
            {activeTab === 'policy' && <PolicyPage />}
            {activeTab === 'settings' && <SettingsView />}
          </Layout>
        </SearchProvider>
      </ProModeProvider>
    </ThemeProvider>
  );
}
