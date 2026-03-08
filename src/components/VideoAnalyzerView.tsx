import React, { useState } from 'react';
import { Video, Loader2, CheckCircle2, AlertCircle, TrendingUp, Copy, Sparkles, Crown } from 'lucide-react';
import { analyzeVideoSEO } from '../services/geminiService';
import { useProMode } from '../context/ProModeContext';

export function VideoAnalyzerView() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const { isPro } = useProMode();

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsLoading(true);
    setError('');
    try {
      const result = await analyzeVideoSEO(title, description, tags, isPro);
      setData(result);
    } catch (err) {
      setError('Failed to analyze video. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Video SEO Analyzer</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Analyze your video metadata to maximize reach and engagement.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b20] p-6 shadow-sm">
          <form onSubmit={handleAnalyze} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">
                Video Title
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 dark:text-white bg-white dark:bg-[#0f1115] shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="e.g., How to Learn React in 2024"
                />
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">
                Description
              </label>
              <div className="mt-2">
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 dark:text-white bg-white dark:bg-[#0f1115] shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="Paste your video description here..."
                />
              </div>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">
                Tags (comma separated)
              </label>
              <div className="mt-2">
                <input
                  type="text"
                  name="tags"
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="block w-full rounded-lg border-0 py-2.5 px-3 text-slate-900 dark:text-white bg-white dark:bg-[#0f1115] shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  placeholder="react, web development, javascript"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !title.trim() || !description.trim()}
              className="flex w-full items-center justify-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Analyze Video'}
            </button>
          </form>
        </div>

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-800 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {data && !isLoading && (
          <div className="space-y-6">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b20] p-6 shadow-sm flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Overall SEO Score</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Based on our proprietary algorithm</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative h-24 w-24">
                  <svg className="h-full w-full" viewBox="0 0 36 36">
                    <path
                      className="text-slate-200 dark:text-slate-700"
                      strokeWidth="3"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                    <path
                      className={data.seo_score >= 80 ? "text-emerald-500" : data.seo_score >= 50 ? "text-amber-500" : "text-red-500"}
                      strokeDasharray={`${data.seo_score}, 100`}
                      strokeWidth="3"
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="none"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white">{data.seo_score}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b20] p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Title Score</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{data.title_score}/100</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-[#0f1115] rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${data.title_score}%` }}></div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b20] p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Description Score</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{data.description_score}/100</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-[#0f1115] rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${data.description_score}%` }}></div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b20] p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Tags Score</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{data.tags_score}/100</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-[#0f1115] rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${data.tags_score}%` }}></div>
                </div>
              </div>
              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b20] p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" /> Viral Potential
                  </span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{data.viral_potential}/100</span>
                </div>
                <div className="h-2 w-full bg-slate-100 dark:bg-[#0f1115] rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${data.viral_potential}%` }}></div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b20] p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Actionable Recommendations</h3>
              <ul className="space-y-3">
                {data.recommendations.map((rec: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {isPro && data.ab_test_titles && (
              <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-amber-900 dark:text-amber-300 mb-4 flex items-center gap-2">
                  <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  Pro: A/B Testing Title Variations
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-400 mb-4">
                  Test these highly clickable variations to maximize your CTR.
                </p>
                <div className="space-y-3">
                  {data.ab_test_titles.map((abTitle: string, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-white dark:bg-[#0f1115] rounded-lg border border-amber-100 dark:border-amber-800 p-3">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{abTitle}</span>
                      <button 
                        onClick={() => handleCopy(abTitle, `ab_title_${i}`)}
                        className="text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-300 transition-colors"
                      >
                        {copiedField === `ab_title_${i}` ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {data.optimized_metadata && (
              <div className="rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-900/10 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300 mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  Optimized Metadata Solution
                </h3>
                <p className="text-sm text-indigo-700 dark:text-indigo-400 mb-6">
                  Use this AI-generated optimized metadata to maximize your video's SEO score (95+).
                </p>
                
                <div className="space-y-4">
                  <div className="bg-white dark:bg-[#0f1115] rounded-lg border border-indigo-100 dark:border-indigo-800 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500">Optimized Title</span>
                      <button 
                        onClick={() => handleCopy(data.optimized_metadata.title, 'title')}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                      >
                        {copiedField === 'title' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{data.optimized_metadata.title}</p>
                  </div>

                  <div className="bg-white dark:bg-[#0f1115] rounded-lg border border-indigo-100 dark:border-indigo-800 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500">Optimized Description</span>
                      <button 
                        onClick={() => handleCopy(data.optimized_metadata.description, 'description')}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                      >
                        {copiedField === 'description' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap">{data.optimized_metadata.description}</p>
                  </div>

                  <div className="bg-white dark:bg-[#0f1115] rounded-lg border border-indigo-100 dark:border-indigo-800 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold uppercase tracking-wider text-indigo-500">Optimized Tags</span>
                      <button 
                        onClick={() => handleCopy(data.optimized_metadata.tags, 'tags')}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                      >
                        {copiedField === 'tags' ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 font-mono">{data.optimized_metadata.tags}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
