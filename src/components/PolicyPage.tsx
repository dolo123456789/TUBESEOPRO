import React from 'react';
import { Shield } from 'lucide-react';

export function PolicyPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-center gap-2">
          <Shield className="h-8 w-8 text-indigo-600" />
          Privacy Policy
        </h1>
        <p className="text-slate-500 dark:text-slate-400">Your privacy is our priority.</p>
      </div>
      <div className="bg-white dark:bg-[#1a1b20] p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Data Collection</h2>
        <p className="text-slate-600 dark:text-slate-300">We collect minimal data required to provide our SEO analysis services. We do not share your personal information with third parties.</p>
        
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Use of Data</h2>
        <p className="text-slate-600 dark:text-slate-300">Data is used solely for the purpose of analyzing your video metadata and providing SEO recommendations.</p>
        
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Security</h2>
        <p className="text-slate-600 dark:text-slate-300">We implement industry-standard security measures to protect your data from unauthorized access.</p>
      </div>
    </div>
  );
}
