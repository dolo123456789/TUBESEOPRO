import React, { useState, useEffect, useMemo } from 'react';
import { Search, Loader2, Info, Lock, X, List, Crown, History, Download, Globe, ArrowUpDown, ExternalLink, Play } from 'lucide-react';
import { generateKeywordData, generateBulkKeywordData } from '../services/geminiService';
import { useSearchContext } from '../context/SearchContext';
import { useProMode } from '../context/ProModeContext';

const REGIONS = [
  { id: 'Global', name: 'Global', flag: '🌐' },
  { id: 'Sénégal', name: 'Sénégal', flag: '🇸🇳' },
  { id: 'France', name: 'France', flag: '🇫🇷' },
  { id: 'États-Unis', name: 'États-Unis', flag: '🇺🇸' },
  { id: 'Côte d\'Ivoire', name: 'Côte d\'Ivoire', flag: '🇨🇮' },
  { id: 'Mali', name: 'Mali', flag: '🇲🇱' },
];

export function KeywordToolView() {
  const [keyword, setKeyword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [bulkData, setBulkData] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [region, setRegion] = useState('Global');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  
  const { isPro } = useProMode();
  const { setLastKeyword } = useSearchContext();

  useEffect(() => {
    const savedHistory = localStorage.getItem('tubeseo_keyword_history');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  useEffect(() => {
    if (!isPro && isBulkMode) {
      setIsBulkMode(false);
      setBulkData(null);
    }
  }, [isPro, isBulkMode]);

  const addToHistory = (kw: string) => {
    const newHistory = [kw, ...searchHistory.filter(h => h !== kw)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('tubeseo_keyword_history', JSON.stringify(newHistory));
  };

  const handleSearch = async (e?: React.FormEvent, searchKw?: string) => {
    if (e) e.preventDefault();
    const targetKw = searchKw || keyword;
    if (!targetKw.trim()) return;

    setIsLoading(true);
    setError('');
    try {
      if (isBulkMode) {
        const keywordsList = targetKw.split('\n').map(k => k.trim()).filter(k => k.length > 0);
        if (keywordsList.length > 20) {
          throw new Error("Veuillez entrer un maximum de 20 mots-clés pour la recherche en masse.");
        }
        const result = await generateBulkKeywordData(keywordsList, isPro, region);
        setBulkData(result);
        setData(null);
        setLastKeyword(keywordsList[0]);
        keywordsList.forEach(k => addToHistory(k));
      } else {
        const result = await generateKeywordData(targetKw, isPro, region);
        setData(result);
        setBulkData(null);
        setLastKeyword(targetKw);
        addToHistory(targetKw);
      }
      setActiveTab('overview');
      if (searchKw) setKeyword(searchKw);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Échec de l'analyse du mot-clé. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    if (bulkData) {
      csvContent += "Mot-cle,Volume,Concurrence,Score Global\n";
      bulkData.forEach(item => {
        csvContent += `"${item.keyword}","${item.search_volume}","${item.competition}",${item.overall_score}\n`;
      });
    } else if (data) {
      csvContent += "Type,Mot-cle,Volume,Score\n";
      data.related_keywords.forEach((item: any) => csvContent += `Associe,"${item.keyword}","${item.volume}",${item.score}\n`);
      data.matching_terms.forEach((item: any) => csvContent += `Correspondant,"${item.keyword}","${item.volume}",${item.score}\n`);
      data.questions.forEach((item: any) => csvContent += `Question,"${item.keyword}","${item.volume}",${item.score}\n`);
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `keywords_${keyword || 'export'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'desc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'desc') {
      direction = 'asc';
    }
    setSortConfig({ key, direction });
  };

  const sortedList = (list: any[]) => {
    if (!sortConfig) return list;
    return [...list].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortConfig.direction === 'asc') {
        return aStr.localeCompare(bStr);
      }
      return bStr.localeCompare(aStr);
    });
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
    const sortedData = sortedList(list || []);
    
    return (
      <div className="bg-white dark:bg-[#1a1b20] rounded-xl border border-slate-200 dark:border-slate-800 p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-slate-900 dark:text-white font-bold flex items-center gap-2">
            {title} <Info className="h-4 w-4 text-slate-500" />
          </h3>
          {isPro && list && list.length > 0 && (
            <button onClick={exportToCSV} className="text-xs flex items-center gap-1 text-slate-500 hover:text-blue-500 transition-colors">
              <Download className="h-3 w-3" /> Exporter
            </button>
          )}
        </div>
        
        {list && list.length > 0 ? (
          <div className={`overflow-x-auto transition-all duration-500 ${!isPro ? 'blur-md select-none pointer-events-none opacity-40' : ''}`}>
            <table className="w-full text-left text-sm text-slate-600 dark:text-slate-400">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-[#2a2b30]/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th onClick={() => handleSort('keyword')} className="px-4 py-3 font-medium rounded-tl-lg cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                    <div className="flex items-center gap-1">Mot-clé <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                  <th onClick={() => handleSort('volume')} className="px-4 py-3 font-medium cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                    <div className="flex items-center gap-1">Volume <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                  <th onClick={() => handleSort('score')} className="px-4 py-3 font-medium rounded-tr-lg cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors">
                    <div className="flex items-center gap-1">Score <ArrowUpDown className="h-3 w-3" /></div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((item, i) => (
                  <tr key={i} className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-[#2a2b30]/30 transition-colors">
                    <td className="px-4 py-3 text-slate-900 dark:text-white font-medium">
                      <button onClick={() => handleSearch(undefined, item.keyword)} className="hover:text-blue-500 transition-colors text-left">
                        {item.keyword}
                      </button>
                    </td>
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
            <a href="#" className="text-blue-600 dark:text-blue-500 text-sm hover:underline">Curieux de savoir comment fonctionnent les {title.toLowerCase()} ? Laissez-nous vous expliquer</a>
          </div>
        )}

        {!isPro && list && list.length > 0 && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 bg-white/10 dark:bg-black/10 backdrop-blur-[2px]">
            <div className="bg-white dark:bg-[#1a1b20] p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 text-center max-w-xs transform animate-in fade-in zoom-in duration-500">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="h-6 w-6 text-amber-500" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Résultats Pro Limités</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Passez à la version <b>Pro</b> pour débloquer tous les mots-clés et analyses détaillées.
              </p>
              <button 
                onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 rounded-xl shadow-lg shadow-amber-500/20 transition-all"
              >
                Débloquer maintenant
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-[#0f1115] rounded-2xl p-6 shadow-xl text-slate-900 dark:text-white min-h-[80vh]">
      {/* Region & History Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-100 dark:bg-[#1a1b20] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
            <Globe className="h-4 w-4 text-slate-500" />
            <select 
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="bg-transparent border-0 text-xs font-bold focus:ring-0 outline-none cursor-pointer"
            >
              {REGIONS.map(r => (
                <option key={r.id} value={r.id}>{r.flag} {r.name}</option>
              ))}
            </select>
          </div>

          {searchHistory.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar max-w-[300px] sm:max-w-md">
              <History className="h-4 w-4 text-slate-400 shrink-0" />
              {searchHistory.map((h, i) => (
                <button 
                  key={i}
                  onClick={() => handleSearch(undefined, h)}
                  className="whitespace-nowrap bg-slate-100 dark:bg-[#1a1b20] hover:bg-slate-200 dark:hover:bg-[#2a2b30] text-[10px] font-bold px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-800 transition-colors"
                >
                  {h}
                </button>
              ))}
            </div>
          )}
        </div>

        {isPro && (data || bulkData) && (
          <button 
            onClick={exportToCSV}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition-all shadow-lg shadow-emerald-600/20"
          >
            <Download className="h-4 w-4" /> Exporter CSV
          </button>
        )}
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative mb-6">
        <div className="relative flex items-start bg-slate-100 dark:bg-[#1a1b20] rounded-xl border border-slate-200 dark:border-slate-800 focus-within:border-blue-500 transition-colors overflow-hidden">
          {isBulkMode ? (
            <textarea
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-transparent border-0 py-4 pl-4 pr-12 text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-0 outline-none min-h-[120px] resize-y"
              placeholder="Entrez jusqu'à 20 mots-clés (un par ligne)..."
            />
          ) : (
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full bg-transparent border-0 py-4 pl-4 pr-12 text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-0 outline-none"
              placeholder="Rechercher des mots-clés..."
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
            {isBulkMode ? 'Analyser les mots-clés' : 'Analyser le mot-clé'}
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
          <button 
            onClick={() => setActiveTab('top_videos')}
            className={`whitespace-nowrap pb-4 -mb-4 border-b-2 text-sm font-medium transition-colors ${activeTab === 'top_videos' ? 'border-blue-500 text-slate-900 dark:text-white' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            Top Vidéos
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsBulkMode(false)}
            className={`${!isBulkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-slate-100 dark:bg-[#1a1b20] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-800'} px-4 py-1.5 rounded-full text-sm font-medium transition-colors`}
          >
            Recherche simple
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
            {!isPro ? <Lock className="h-4 w-4 text-amber-500" /> : <List className="h-4 w-4" />} Recherche en masse
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
              Analyse de mots-clés en masse <Info className="h-4 w-4 text-slate-500" />
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
                  {isPro && <th className="px-4 py-3 font-medium">Pro Insight</th>}
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
                    {isPro && (
                      <td className="px-4 py-3 text-xs italic text-slate-500 dark:text-slate-400 max-w-[200px] truncate">
                        {item.pro_insight || '-'}
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
                  <Search className="h-4 w-4" /> Obtenir des idées de vidéos
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
              
              <p className="text-slate-500 dark:text-slate-400 text-sm mb-1">Score global</p>
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
            
            {/* Pro Data Section */}
            <div className="mt-6">
              {!isPro ? (
                <button 
                  onClick={() => document.getElementById('pricing-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full bg-slate-100 dark:bg-[#1a1b20] rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-6 flex items-center justify-between group hover:border-amber-500/50 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/20 rounded-full flex items-center justify-center">
                      <Crown className="h-6 w-6 text-amber-500" />
                    </div>
                    <div className="text-left">
                      <p className="text-slate-900 dark:text-white font-bold">Données Pro : CPC estimé et tendances</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Débloquez la monétisation avancée et les données de tendance</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500 font-bold text-sm">
                    <Lock className="h-4 w-4" /> Débloquer Pro
                  </div>
                </button>
              ) : data.cpc !== undefined ? (
                <div className="bg-white dark:bg-[#1a1b20] rounded-xl border border-amber-200 dark:border-amber-500/30 p-6 flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-amber-700 dark:text-amber-500 font-bold mb-1 flex items-center gap-2">
                        <Crown className="h-4 w-4" /> Données Pro : CPC estimé
                      </p>
                      <p className="text-2xl font-bold text-slate-900 dark:text-white">${Number(data.cpc || 0).toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-700 dark:text-amber-500 font-bold mb-1">Tendance de recherche</p>
                      <p className={`text-xl font-bold capitalize ${data.trend === 'Up' ? 'text-emerald-500' : data.trend === 'Down' ? 'text-red-500' : 'text-slate-900 dark:text-white'}`}>
                        {data.trend}
                      </p>
                    </div>
                  </div>
                  {data.pro_insight && (
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                      <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold mb-1">Aperçu stratégique Pro</p>
                      <p className="text-sm text-slate-900 dark:text-white italic">"{data.pro_insight}"</p>
                    </div>
                  )}
                  {data.difficulty_score !== undefined && (
                    <div className="border-t border-slate-200 dark:border-slate-800 pt-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold">Difficulté de classement</p>
                        <span className={`text-sm font-bold ${data.difficulty_score > 70 ? 'text-red-500' : data.difficulty_score > 40 ? 'text-amber-500' : 'text-emerald-500'}`}>
                          {data.difficulty_score}/100
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-2">
                        <div 
                          className={`h-full transition-all duration-1000 ${data.difficulty_score > 70 ? 'bg-red-500' : data.difficulty_score > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${data.difficulty_score}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {data.difficulty_reason}
                      </p>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
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
                {renderKeywordList(data.matching_terms, "Termes correspondants", "", "Nous ne trouvons aucun terme correspondant à")}
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

            {(activeTab === 'overview' || activeTab === 'top_videos') && (
              <div className="bg-white dark:bg-[#1a1b20] rounded-xl border border-slate-200 dark:border-slate-800 p-6">
                <h3 className="text-slate-900 dark:text-white font-bold flex items-center gap-2 mb-6">
                  Top Vidéos Classées <Info className="h-4 w-4 text-slate-500" />
                </h3>
                <div className="space-y-4">
                  {data.top_ranking_videos?.map((video: any, i: number) => (
                    <a 
                      key={i} 
                      href={video.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-[#2a2b30]/30 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-800 group"
                    >
                      <div className="relative w-32 aspect-video rounded-lg overflow-hidden shrink-0 shadow-md">
                        <img 
                          src={video.thumbnail_url} 
                          alt={video.title} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                          <Play className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="absolute bottom-1 right-1 bg-black/80 text-[10px] text-white px-1 rounded">
                          {i + 1}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 mb-1 group-hover:text-blue-500 transition-colors">
                          {video.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-slate-500 dark:text-slate-400">
                          <span className="font-bold text-blue-500 flex items-center gap-1">
                            {video.channel} <ExternalLink className="h-2 w-2" />
                          </span>
                          <span>•</span>
                          <span>{video.views} vues</span>
                          <span>•</span>
                          <span>{video.published}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                  {(!data.top_ranking_videos || data.top_ranking_videos.length === 0) && (
                    <p className="text-center text-slate-500 py-4">Aucune vidéo trouvée pour ce mot-clé.</p>
                  )}
                </div>
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
