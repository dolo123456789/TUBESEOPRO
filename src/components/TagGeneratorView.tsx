import React, { useState } from 'react';
import { Tags, Loader2, Copy, CheckCircle2, AlertCircle } from 'lucide-react';
import { generateTags } from '../services/geminiService';
import { ProGatedView } from './ProGatedView';

export function TagGeneratorView({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsLoading(true);
    setError('');
    setCopied(false);
    try {
      const result = await generateTags(topic);
      setTags(result);
    } catch (err) {
      setError('Échec de la génération des tags. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (tags.length === 0) return;
    navigator.clipboard.writeText(tags.join(', '));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="text-center">
        <div className="mx-auto h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
          <Tags className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Générateur de Tags YouTube</h1>
        <p className="mt-2 text-lg text-slate-500 dark:text-slate-400">Générez des tags hautement optimisés pour booster la découvrabilité de votre vidéo.</p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b20] p-8 shadow-md">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label htmlFor="topic" className="block text-sm font-medium leading-6 text-slate-900 dark:text-slate-300">
              Sujet de la vidéo ou mot-clé principal
            </label>
            <div className="mt-2 relative rounded-md shadow-sm">
              <input
                type="text"
                name="topic"
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="block w-full rounded-xl border-0 py-4 px-4 text-slate-900 dark:text-white bg-white dark:bg-[#0f1115] ring-1 ring-inset ring-slate-300 dark:ring-slate-700 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-lg sm:leading-6"
                placeholder="ex: psychologie humaine, tutoriel react"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !topic.trim()}
            className="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Génération des tags...
              </>
            ) : (
              'Générer les tags'
            )}
          </button>
        </form>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm text-red-800 dark:text-red-400 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            {error}
          </div>
        )}

        {tags.length > 0 && !isLoading && (
          <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Tags générés ({tags.length})</h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
              >
                {copied ? (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Copié !
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Tout copier
                  </>
                )}
              </button>
            </div>
            
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0f1115] p-6">
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-full bg-white dark:bg-[#2a2b30] px-3 py-1 text-sm font-medium text-slate-700 dark:text-slate-300 ring-1 ring-inset ring-slate-200 dark:ring-slate-700 hover:bg-slate-100 dark:hover:bg-[#3a3b40] cursor-default transition-colors"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1115] p-4">
              <p className="text-sm text-slate-500 dark:text-slate-400 font-mono break-all">
                {tags.join(', ')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
