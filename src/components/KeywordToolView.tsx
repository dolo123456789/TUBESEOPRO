import React, { useState, useEffect } from 'react';
import { Search, Loader2, Info, Lock, X, List } from 'lucide-react';
import { generateKeywordData, generateBulkKeywordData } from '../services/geminiService';
import { useSearchContext } from '../context/SearchContext';
import { useProMode } from '../context/ProModeContext';

export function KeywordToolView() {
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [bulkData, setBulkData] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const { isPro } = useProMode();
  const { setLastKeyword } = useSearchContext();

  useEffect(() => {
    if (!isPro && isBulkMode) {
      setIsBulkMode(false);
      setBulkData(null);
    }
  }, [isPro, isBulkMode]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setIsLoading(true);
    setError('');
    try {
      if (isBulkMode) {
        const keywordsList = keyword.split('\n').map(k => k.trim()).filter(k => k.length > 0);
        if (keywordsList.length > 20) {
          throw new Error("Please enter a maximum of 20 keywords for bulk search.");
        }
        const result = await generateBulkKeywordData(keywordsList, isPro);
        setBulkData(result);
        setData(null);
        setLastKeyword(keywordsList[0]); // Use first keyword as representative
      } else {
        const result = await generateKeywordData(keyword, isPro);
        setData(result);
        setBulkData(null);
        setLastKeyword(keyword);
      }
      setActiveTab('overview');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to analyze keyword. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setKeyword('');
    setData(null);
    setBulkData(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 60) return 'text-emerald-400';
    if (score >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  const getScoreStroke = (score: number) => {
    if (score >= 60) return '#34d399';
    if (score >= 40) return '#fbbf24';
    return '#f87171';
  };

  const renderKeywordList = (list: any[], title: string, description: string, emptyMessage: string) => {
    return (
      <div className="bg-white dark:bg-[#1a1b20] rounded-xl border border-slate-200 dark:border-slate-800 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-slate-900 dark:text-white font-bold flex items-center gap-2">
            {title} <Info className="h-4 w-4 text-slate-500" />
          </h3>
        </div>
        
        {list && list.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-[#2a2b30]/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-lg">Mot-clé</th>
                  <th className="px-4 py-3 font-medium">Volume</th>
                  <th className="px-4 py-3 font-medium rounded-tr-lg">Score</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-[#2a2b30]/30 transition-colors">
                    <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">{item.keyword}</td>
                    <td className="px-4 py-3">{item.volume}</td>
                    <td className={`px-4 py-3 font-bold ${getScoreColor(item.score)}`}>{item.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="bg-slate-50 dark:bg-[#2a2b30]/50 rounded-xl p-8 text-center border border-slate-200 dark:border-slate-800">
            <p className="text-slate-500 dark:text-slate-400 mb-2">{emptyMessage}</p>
            <p className="text-slate-900 dark:text-white font-bold mb-4">{keyword}</p>
            <p className="text-slate-500 text-sm mb-6">Essayez de rechercher un terme plus large</p>
            <a href="#" className="text-blue-600 dark:text-blue-500 text-sm hover:underline">Curious about how {title.toLowerCase()} work? Let us explain</a>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-[#0f1115] rounded-2xl p-6 shadow-xl text-slate-900 dark:text-white min-h-[80vh]">
      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative mb-6">
        <div className="relative flex items-start bg-slate-100 dark:bg-[#1a1b20] rounded-xl border border-slate-200 dark:border-slate-800 focus-within:border-blue-500 transition-colors overflow-hidden">
          {isBulkMode ? (
            <textarea
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-transparent border-0 py-4 pl-4 pr-12 text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-0 outline-none min-h-[120px] resize-y"
              placeholder="Enter up to 20 keywords (one per line)..."
            />
          ) : (
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-transparent border-0 py-4 pl-4 pr-12 text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-0 outline-none"
              placeholder="Search keywords..."
            />
          )}
          {keyword && (
            <button type="button" onClick={clearSearch} className="absolute right-4 top-4 text-slate-500 hover:text-slate-900 dark:hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <button type="submit" disabled={isLoading || !keyword.trim()} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            {isBulkMode ? 'Analyze Keywords' : 'Analyze Keyword'}
          </button>
        </div>
      </form>

      {/* Tabs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap pb-4 -mb-4 border-b-2 text-sm font-medium transition-colors ${activeTab === 'overview' ? 'border-blue-500 text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Aperçu
          </button>
          <button 
            onClick={() => setActiveTab('related')}
            className={`whitespace-nowrap pb-4 -mb-4 border-b-2 text-sm font-medium transition-colors ${activeTab === 'related' ? 'border-blue-500 text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Mots clés associés
          </button>
          <button 
            onClick={() => setActiveTab('matching')}
            className={`whitespace-nowrap pb-4 -mb-4 border-b-2 text-sm font-medium transition-colors ${activeTab === 'matching' ? 'border-blue-500 text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Termes correspondants
          </button>
          <button 
            onClick={() => setActiveTab('questions')}
            className={`whitespace-nowrap pb-4 -mb-4 border-b-2 text-sm font-medium transition-colors ${activeTab === 'questions' ? 'border-blue-500 text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Des questions
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsBulkMode(false)}
            className={`${!isBulkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-100 dark:bg-[#1a1b20] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'} px-4 py-1.5 rounded-full text-sm font-medium transition-colors`}
          >
            Single search
          </button>
          <button 
            onClick={() => {
              if (isPro) {
                setIsBulkMode(true);
                setError('');
              } else {
                setError("La recherche en masse (Bulk Search) est une fonctionnalité Pro. Veuillez activer le mode Pro pour l'utiliser.");
              }
            }}
            className={`flex items-center gap-2 ${isBulkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-100 dark:bg-[#1a1b20] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'} px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!isPro ? 'opacity-80' : ''}`}
          >
            {!isPro ? <Lock className="h-4 w-4 text-amber-500" /> : <List className="h-4 w-4" />} Bulk search
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
          <p className="text-slate-500 dark:text-slate-400">Analyse du mot-clé en cours...</p>
        </div>
      ) : error ? (
        <div className="bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 p-4 rounded-xl text-center">
          {error}
        </div>
      ) : bulkData ? (
        <div className="bg-white dark:bg-[#1a1b20] rounded-xl border border-slate-200 dark:border-slate-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-slate-900 dark:text-white font-bold flex items-center gap-2">
              Bulk Keyword Analysis <Info className="h-4 w-4 text-slate-500" />
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-[#2a2b30]/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-lg">Mot-clé</th>
                  <th className="px-4 py-3 font-medium">Volume</th>
                  <th className="px-4 py-3 font-medium">Concurrence</th>
                  {isPro && <th className="px-4 py-3 font-medium">CPC</th>}
                  <th className="px-4 py-3 font-medium rounded-tr-lg">Score Global</th>
                </tr>
              </thead>
              <tbody>
                {bulkData.map((item, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-[#2a2b30]/30 transition-colors">
                    <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">{item.keyword}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {item.search_volume}
                        <span className="text-xs text-slate-500">({item.search_volume_trend})</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {item.competition}
                        <span className="text-xs text-slate-500">({item.competition_trend})</span>
                      </div>
                    </td>
                    {isPro && (
                      <td className="px-4 py-3 text-amber-600 dark:text-amber-500">
                        {item.cpc !== undefined ? `$${Number(item.cpc || 0).toFixed(2)}` : '-'}
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${getScoreColor(item.overall_score || 0)}`}>{item.overall_score || 0}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-[#2a2b30] ${getScoreColor(item.overall_score || 0)}`}>
                          {item.score_label}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Overview */}
          <div className={`space-y-6 ${activeTab !== 'overview' && 'hidden lg:block'}`}>
            <div className="bg-white dark:bg-[#1a1b20] rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-slate-100 dark:bg-[#2a2b30] text-xs text-slate-600 dark:text-slate-300 px-4 py-1 rounded-b-lg border-x border-b border-slate-200 dark:border-slate-700">
                Découvrez la taille de l'audience de ce mot clé et sa compétitivité
              </div>
              
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-8 mb-8 text-left w-full">
                Aperçu: {keyword}
              </h2>
              
              <div className="w-full flex justify-start mb-8">
                <button className="flex items-center gap-2 bg-slate-100 dark:bg-[#2a2b30] hover:bg-slate-200 dark:hover:bg-[#3a3b40] text-slate-900 dark:text-white px-4 py-2 rounded-full text-sm font-medium transition-colors border border-slate-200 dark:border-slate-700">
                  <Search className="h-4 w-4" /> Get video ideas
                </button>
              </div>

              {/* Gauge Chart Simulation */}
              <div className="relative w-48 h-24 mb-6">
                <svg viewBox="0 0 100 50" className="w-full h-full overflow-visible">
                  {/* Background Arc */}
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#e2e8f0" className="dark:stroke-[#2a2b30]" strokeWidth="12" strokeLinecap="round" />
                  {/* Foreground Arc */}
                  <path 
                    d="M 10 50 A 40 40 0 0 1 90 50" 
                    fill="none" 
                    stroke={getScoreStroke(data.overall_score || 0)} 
                    strokeWidth="12" 
                    strokeLinecap="round" 
                    strokeDasharray={`${(Number(data.overall_score || 0) / 100) * 125} 125`}
                  />
                </svg>
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
                  <span className={`text-3xl font-bold ${getScoreColor(data.overall_score || 0)}`}>{data.overall_score || 0}</span>
                </div>
              </div>
              
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Overall score</p>
              <p className={`font-bold uppercase tracking-wider text-sm mb-8 ${getScoreColor(data.overall_score || 0)}`}>
                {data.score_label}
              </p>

              <div className="grid grid-cols-2 w-full gap-4 pt-6 border-t border-slate-200 dark:border-slate-800">
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Volume de recherche</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{data.search_volume}</p>
                  <span className="bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-xs px-2 py-1 rounded border border-red-200 dark:border-red-500/20">
                    {data.search_volume_trend}
                  </span>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Concurrence</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{data.competition}</p>
                  <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs px-2 py-1 rounded border border-emerald-200 dark:border-emerald-500/20">
                    {data.competition_trend}
                  </span>
                </div>
              </div>
            </div>
            
            {isPro && data.cpc !== undefined && (
              <div className="bg-white dark:bg-[#1a1b20] rounded-xl border border-amber-200 dark:border-amber-500/30 p-6 flex items-center justify-between">
                <div>
                  <p className="text-amber-700 dark:text-amber-500 font-bold mb-1">Pro Data: Estimated CPC</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">${Number(data.cpc || 0).toFixed(2)}</p>
                </div>
                <div className="text-right">
                  <p className="text-amber-700 dark:text-amber-500 font-bold mb-1">Search Trend</p>
                  <p className="text-xl font-bold text-slate-900 dark:text-white capitalize">{data.trend}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Dynamic Lists */}
          <div className="space-y-6">
            {(activeTab === 'overview' || activeTab === 'related') && (
              <div className="relative">
                {activeTab === 'overview' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-100 dark:bg-[#2a2b30] text-xs text-slate-600 dark:text-slate-300 px-4 py-1 rounded-full border border-slate-200 dark:border-slate-700 z-10 whitespace-nowrap">
                    Mots-clés liés au mot-clé ou à la phrase que vous recherchez
                  </div>
                )}
                {renderKeywordList(data.related_keywords, "Mots clés associés", "", "Nous ne trouvons aucun mot-clé associé à")}
              </div>
            )}
            
            {(activeTab === 'overview' || activeTab === 'matching') && (
              <div className="relative">
                {activeTab === 'overview' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-100 dark:bg-[#2a2b30] text-xs text-slate-600 dark:text-slate-300 px-4 py-1 rounded-full border border-slate-200 dark:border-slate-700 z-10 whitespace-nowrap">
                    Mots-clés contenant le mot-clé ou l'expression recherché(e) dans n'importe quel ordre
                  </div>
                )}
                {renderKeywordList(data.matching_terms, "Matching keywords", "", "Nous ne trouvons aucun terme correspondant à")}
              </div>
            )}
            
            {(activeTab === 'overview' || activeTab === 'questions') && (
              <div className="relative">
                {activeTab === 'overview' && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-100 dark:bg-[#2a2b30] text-xs text-slate-600 dark:text-slate-300 px-4 py-1 rounded-full border border-slate-200 dark:border-slate-700 z-10 whitespace-nowrap">
                    Mots-clés de type question contenant votre mot-clé ou votre expression
                  </div>
                )}
                {renderKeywordList(data.questions, "Des questions", "", "Nous ne trouvons aucune question pour")}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Search className="h-12 w-12 mb-4 opacity-20" />
          <p>Recherchez un mot-clé pour analyser son potentiel</p>
        </div>
      )}
    </div>
  );
}
