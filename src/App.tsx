/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, Component, ReactNode, ErrorInfo } from 'react';
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

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Oups ! Une erreur est survenue.</h1>
            <p className="text-slate-600 mb-6">L'application a rencontré un problème inattendu. Veuillez rafraîchir la page.</p>
            <div className="bg-slate-100 p-4 rounded-xl overflow-auto max-h-48 mb-6">
              <code className="text-xs text-slate-800">{this.state.error?.toString()}</code>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Rafraîchir l'application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState('landing');
  console.log("App rendering, activeTab:", activeTab);

  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  );
}
