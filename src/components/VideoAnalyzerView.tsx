import React, { useState } from 'react';
import { Video, Loader2, CheckCircle2, AlertCircle, TrendingUp, Copy, Sparkles, Crown, Image as ImageIcon, Wand2, X } from 'lucide-react';
import { analyzeVideoSEO, generateThumbnail } from '../services/geminiService';
import { useProMode } from '../context/ProModeContext';
import { Toast } from './Toast';

export function VideoAnalyzerView() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [data, setData] = useState<any>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<{ horizontal: string, vertical: string } | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
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
    setToast(null);
    setData(null);
    setThumbnailUrl(null);
    try {
      const result = await analyzeVideoSEO(title, description, tags, isPro);
      if (!result || Object.keys(result).length === 0) {
        throw new Error('No data returned from analysis.');
      }
      setData(result);
      setToast({ message: 'Analyse terminée avec succès !', type: 'success' });
    } catch (err) {
      console.error('Analysis error:', err);
      setToast({ message: 'Erreur lors de l\'analyse. Veuillez réessayer.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateThumbnail = async () => {
    if (!data?.thumbnail_prompt) return;
    
    setIsGeneratingThumbnail(true);
    setToast(null);
    try {
      const urls = await generateThumbnail(data.thumbnail_prompt, referenceImage || undefined);
      setThumbnailUrl(urls);
      setToast({ message: 'Miniature générée avec succès !', type: 'success' });
    } catch (err) {
      console.error('Thumbnail generation error:', err);
      setToast({ message: 'Erreur lors de la génération. Veuillez réessayer.', type: 'error' });
    } finally {
      setIsGeneratingThumbnail(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setToast({ message: 'Image size should be less than 5MB', type: 'error' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
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

            {/* Pro Data: CPC & Trends */}
            {isPro && data.cpc !== undefined && (
              <div className="rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 p-6 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-amber-700 dark:text-amber-500 font-bold mb-1 flex items-center gap-2">
                    <Crown className="h-4 w-4" /> Pro: Estimated CPC
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">${Number(data.cpc || 0).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-amber-700 dark:text-amber-500 font-bold mb-1">Search Trend</p>
                  <p className={`text-xl font-bold capitalize ${data.trend === 'Up' ? 'text-emerald-500' : data.trend === 'Down' ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                    {data.trend}
                  </p>
                </div>
              </div>
            )}

            {/* Thumbnail Generation Section */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b20] p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-indigo-500" />
                  Thumbnail Strategy
                </h3>
                <div className="flex items-center justify-end">
                  <button
                    onClick={handleGenerateThumbnail}
                    disabled={isGeneratingThumbnail}
                    className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50"
                  >
                    {isGeneratingThumbnail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                    {thumbnailUrl ? 'Regénérer' : 'Générer'}
                  </button>
                </div>
              </div>
              
              <div className="space-y-6">
                {/* Reference Image Upload */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Reference Image (Optional)</p>
                  <div className="flex items-center gap-4">
                    <label className="flex-1 flex flex-col items-center justify-center h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl hover:border-indigo-500/50 transition-colors cursor-pointer bg-slate-50/50 dark:bg-[#0f1115]/50 overflow-hidden relative">
                      {referenceImage ? (
                        <>
                          <img src={referenceImage} alt="Reference" className="w-full h-full object-cover opacity-50" />
                          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-white/80 dark:bg-black/80 px-2 py-1 rounded">
                            Change Image
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-slate-500">
                          <ImageIcon className="h-6 w-6" />
                          <span className="text-[10px] font-medium">Upload Reference</span>
                        </div>
                      )}
                      <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                    </label>
                    {referenceImage && (
                      <button 
                        onClick={() => setReferenceImage(null)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        title="Remove reference image"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-[#0f1115] rounded-lg p-4 border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">Thumbnail Concept</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300 italic">"{data.thumbnail_prompt}"</p>
                </div>

                {thumbnailUrl && (
                  <div className="space-y-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Generated Results</p>
                    
                    <div className="grid gap-6 md:grid-cols-2">
                      {/* 16:9 Thumbnail */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Format Standard (16:9)</p>
                        <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-indigo-500 shadow-xl group">
                          <img src={thumbnailUrl.horizontal} alt="Generated Thumbnail 16:9" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <button 
                              onClick={() => window.open(thumbnailUrl.horizontal, '_blank')}
                              className="bg-white text-slate-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-slate-100 transition-colors"
                            >
                              Preview
                            </button>
                            <button 
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = thumbnailUrl.horizontal;
                                link.download = `thumbnail-16x9-${Date.now()}.png`;
                                link.click();
                              }}
                              className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-indigo-500 transition-colors"
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* 9:16 Thumbnail */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-slate-600 dark:text-slate-400">Format Short (9:16)</p>
                        <div className="relative aspect-[9/16] w-full max-w-[240px] mx-auto rounded-lg overflow-hidden border-2 border-indigo-500 shadow-xl group">
                          <img src={thumbnailUrl.vertical} alt="Generated Thumbnail 9:16" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-4">
                            <button 
                              onClick={() => window.open(thumbnailUrl.vertical, '_blank')}
                              className="bg-white text-slate-900 px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-slate-100 transition-colors"
                            >
                              Preview
                            </button>
                            <button 
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = thumbnailUrl.vertical;
                                link.download = `thumbnail-9x16-${Date.now()}.png`;
                                link.click();
                              }}
                              className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg hover:bg-indigo-500 transition-colors"
                            >
                              Download
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-indigo-900 dark:text-indigo-300 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    Optimized Metadata Solution
                  </h3>
                  <button
                    onClick={() => handleCopy(`${data.optimized_metadata.title}\n\n${data.optimized_metadata.description}\n\nTags: ${data.optimized_metadata.tags}`, 'metadata')}
                    className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {copiedField === 'metadata' ? 'Copié !' : 'Copier tout'}
                  </button>
                </div>
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
