import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Search, PlaySquare, Zap, Image as ImageIcon, Users, MoreHorizontal, Loader2, TrendingUp, X, Lightbulb, CheckCircle2 } from 'lucide-react';
import { generateOutlierData, analyzeCompetitorChannel } from '../services/geminiService';
import { useProMode } from '../context/ProModeContext';

export function ChannelAuditView() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('videos');
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [channelDetails, setChannelDetails] = useState<any>(null);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const { isPro } = useProMode();

  const handleCardClick = async (channelName: string) => {
    setSelectedChannel(channelName);
    setIsDetailsLoading(true);
    setChannelDetails(null);
    try {
      const details = await analyzeCompetitorChannel(channelName);
      setChannelDetails(details);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setSelectedChannel(null);
    setChannelDetails(null);
  };

  const fetchData = async () => {
    if (!searchQuery.trim()) return;
    setIsLoading(true);
    try {
      const result = await generateOutlierData(searchQuery, activeFilter, isPro);
      setData(result);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery.trim() && data.length > 0) {
      fetchData();
    }
  }, [activeFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const filters = [
    { id: 'videos', label: 'Vidéos', icon: PlaySquare },
    { id: 'shorts', label: 'Shorts', icon: Zap },
    { id: 'miniatures', label: 'Miniatures', icon: ImageIcon },
    { id: 'breakout', label: 'Breakout channels', icon: Users },
  ];

  return (
    <div className="bg-white dark:bg-[#0f1115] rounded-2xl p-6 shadow-xl text-slate-900 dark:text-white min-h-[80vh]">
      {/* Header / Search */}
      <form onSubmit={handleSearch} className="bg-[#1a1b20] p-2 rounded-full flex items-center gap-2 mb-6 border border-slate-800 focus-within:border-blue-500 transition-colors">
        <button type="button" className="flex items-center gap-2 px-4 py-2 bg-[#2a2b30] hover:bg-[#3a3b40] rounded-full text-sm font-medium text-white transition-colors">
          <SlidersHorizontal className="h-4 w-4" />
          Filters
        </button>
        <input
          type="text"
          placeholder="Search videos..."
          className="flex-1 bg-transparent border-0 text-white focus:ring-0 placeholder:text-slate-500 px-2 outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button type="submit" disabled={isLoading} className="h-10 w-10 rounded-full bg-blue-600 hover:bg-blue-500 flex items-center justify-center text-white transition-colors disabled:opacity-50">
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
        </button>
      </form>

      {/* Filters Row */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 hide-scrollbar">
          {filters.map(f => (
            <button
              key={f.id}
              type="button"
              onClick={() => setActiveFilter(f.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === f.id
                  ? 'bg-[#2a2b30] text-white'
                  : 'hover:bg-[#2a2b30] text-slate-400 hover:text-white'
              }`}
            >
              <f.icon className="h-4 w-4" /> {f.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-400">
            Sort by:
            <div className="relative">
              <select className="bg-[#2a2b30] text-white border-0 rounded-full px-4 py-1.5 focus:ring-0 cursor-pointer appearance-none pr-8 outline-none">
                <option>Best match</option>
                <option>Most viewed</option>
                <option>Highest multiplier</option>
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
              </div>
            </div>
          </div>
          <label className="flex items-center gap-2 text-slate-400 cursor-pointer bg-[#2a2b30] px-4 py-1.5 rounded-full hover:text-white transition-colors">
            <div className="relative flex items-center">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-8 h-4 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-blue-500"></div>
            </div>
            Exact keyword match
          </label>
        </div>
      </div>

      {/* Grid */}
      {data.length > 0 ? (
        <>
          {activeFilter === 'videos' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.map((video, i) => (
                <div key={i} className="bg-[#1a1b20] rounded-xl overflow-hidden border border-slate-800 hover:border-slate-700 transition-colors group cursor-pointer flex flex-col">
                  <div className="aspect-video relative bg-slate-800" onClick={() => handleCardClick(video.channel_name)}>
                    <img 
                      src={video.thumbnail_url} 
                      alt={video.title} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${video.title}/640/360`;
                      }}
                    />
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                      {video.engagement_rate} eng.
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex flex-col gap-1">
                        <div className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full w-fit">
                          {video.multiplier.toFixed(1)}x Outlier
                        </div>
                        <p className="text-[10px] text-slate-500">vs {video.channel_avg_views} avg</p>
                      </div>
                      <a 
                        href={video.video_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-blue-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <PlaySquare className="h-5 w-5" />
                      </a>
                    </div>
                    <h3 className="text-white font-bold text-sm line-clamp-2 mb-2 leading-tight group-hover:text-blue-400 transition-colors" onClick={() => handleCardClick(video.channel_name)}>
                      {video.title}
                    </h3>
                    <div className="mt-auto">
                      <a 
                        href={video.channel_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-slate-400 hover:text-blue-400 text-xs mb-1 block transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {video.channel_name} • {video.subscribers} abonnés
                      </a>
                      <p className="text-slate-500 text-xs">
                        {video.views} views • {video.published_time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeFilter === 'shorts' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {data.map((video, i) => (
                <div key={i} className="bg-[#1a1b20] rounded-xl overflow-hidden border border-slate-800 hover:border-slate-700 transition-colors group cursor-pointer flex flex-col">
                  <div className="aspect-[9/16] relative bg-slate-800" onClick={() => handleCardClick(video.channel_name)}>
                    <img 
                      src={video.thumbnail_url} 
                      alt={video.title} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${video.title}/360/640`;
                      }}
                    />
                    <div className="absolute top-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {video.multiplier.toFixed(1)}x
                    </div>
                  </div>
                  <div className="p-3 flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] text-slate-500">{video.engagement_rate} engagement</p>
                      <a 
                        href={video.video_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-slate-500 hover:text-blue-400 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Zap className="h-4 w-4" />
                      </a>
                    </div>
                    <h3 className="text-white font-bold text-xs line-clamp-2 mb-1 leading-tight group-hover:text-blue-400 transition-colors" onClick={() => handleCardClick(video.channel_name)}>
                      {video.title}
                    </h3>
                    <div className="mt-auto">
                      <p className="text-slate-400 text-[10px]">
                        {video.views} views • {video.channel_name}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeFilter === 'miniatures' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {data.map((video, i) => (
                <div key={i} onClick={() => handleCardClick(video.channel_name)} className="relative group cursor-pointer rounded-xl overflow-hidden border border-slate-800">
                  <div className="aspect-video relative bg-slate-800">
                    <img 
                      src={video.thumbnail_url} 
                      alt={video.title} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${video.title}/640/360`;
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                    <h3 className="text-white font-bold text-sm line-clamp-2 mb-1">{video.title}</h3>
                    <p className="text-blue-400 text-xs font-bold">{video.multiplier.toFixed(1)}x Outlier ({video.views} views)</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeFilter === 'breakout' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {data.map((channel, i) => (
                <div key={i} className="bg-[#1a1b20] rounded-xl p-6 border border-slate-800 flex flex-col items-center text-center hover:border-slate-700 transition-colors cursor-pointer group">
                  <div className="w-20 h-20 rounded-full overflow-hidden mb-4 bg-slate-800 border-2 border-transparent group-hover:border-blue-500 transition-colors" onClick={() => handleCardClick(channel.channel_name)}>
                    <img 
                      src={channel.avatar_url} 
                      alt={channel.channel_name} 
                      className="w-full h-full object-cover" 
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(channel.channel_name)}&background=random`;
                      }}
                    />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1" onClick={() => handleCardClick(channel.channel_name)}>{channel.channel_name}</h3>
                  <a 
                    href={channel.channel_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 text-xs mb-3 underline"
                  >
                    Voir la chaîne
                  </a>
                  <div className="flex flex-col gap-1 mb-3">
                    <p className="text-slate-400 text-sm">{channel.subscribers} abonnés</p>
                    <p className="text-slate-500 text-xs">{channel.total_views} vues totales • {channel.video_count} vidéos</p>
                  </div>
                  <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 text-sm font-bold px-3 py-1 rounded-full mb-4">
                    <TrendingUp className="h-4 w-4" /> {channel.growth_rate}
                  </div>
                  <div className="w-full bg-[#2a2b30] rounded-lg p-3 text-left">
                    <p className="text-xs text-slate-500 mb-1">Top Breakout Video:</p>
                    <p className="text-sm text-slate-300 line-clamp-2 leading-tight">{channel.top_video_title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      ) : !isLoading && (
        <div className="flex flex-col items-center justify-center py-20 text-slate-500">
          <Search className="h-12 w-12 mb-4 opacity-20" />
          <p>Search for a topic to discover breakout videos</p>
        </div>
      )}

      {/* Modal */}
      {selectedChannel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1a1b20] rounded-2xl border border-slate-800 w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-slate-800">
              <div className="flex flex-col">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Users className="h-6 w-6 text-blue-500" />
                  Analyse de la chaîne : {channelDetails?.real_channel_name || selectedChannel}
                </h2>
                {channelDetails?.real_channel_name && channelDetails.real_channel_name !== selectedChannel && (
                  <p className="text-xs text-slate-500 ml-8">Résultat le plus pertinent trouvé pour "{selectedChannel}"</p>
                )}
              </div>
              {channelDetails && (
                <a 
                  href={channelDetails.channel_url} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-sm text-blue-400 hover:text-blue-300 underline"
                >
                  Visiter la chaîne
                </a>
              )}
              <button onClick={closeDetails} className="text-slate-400 hover:text-white transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
              {isDetailsLoading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <Loader2 className="h-10 w-10 text-blue-500 animate-spin mb-4" />
                  <p className="text-slate-400">Analyse approfondie de la chaîne en cours...</p>
                </div>
              ) : channelDetails ? (
                <div className="space-y-8">
                  {/* Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                    <div className="bg-[#2a2b30] rounded-xl p-4 border border-slate-700">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Abonnés</p>
                      <p className="text-xl font-bold text-white">
                        {channelDetails.estimated_subscribers >= 1000000 
                          ? `${(channelDetails.estimated_subscribers / 1000000).toFixed(1)}M` 
                          : channelDetails.estimated_subscribers >= 1000 
                            ? `${(channelDetails.estimated_subscribers / 1000).toFixed(1)}K` 
                            : channelDetails.estimated_subscribers}
                      </p>
                    </div>
                    <div className="bg-[#2a2b30] rounded-xl p-4 border border-slate-700">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Vues moy.</p>
                      <p className="text-xl font-bold text-white">
                        {channelDetails.avg_views_per_video >= 1000000 
                          ? `${(channelDetails.avg_views_per_video / 1000000).toFixed(1)}M` 
                          : channelDetails.avg_views_per_video >= 1000 
                            ? `${(channelDetails.avg_views_per_video / 1000).toFixed(1)}K` 
                            : channelDetails.avg_views_per_video}
                      </p>
                    </div>
                    <div className="bg-[#2a2b30] rounded-xl p-4 border border-slate-700">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Engagement</p>
                      <p className="text-xl font-bold text-emerald-400">{channelDetails.engagement_rate}</p>
                    </div>
                    <div className="bg-[#2a2b30] rounded-xl p-4 border border-slate-700">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Revenus est.</p>
                      <p className="text-xl font-bold text-blue-400">{channelDetails.estimated_monthly_revenue}</p>
                    </div>
                    <div className="bg-[#2a2b30] rounded-xl p-4 border border-slate-700 col-span-2 sm:col-span-1">
                      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Fréquence</p>
                      <p className="text-lg font-bold text-white capitalize truncate">{channelDetails.upload_frequency}</p>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Search className="h-5 w-5 text-slate-400" /> Mots-clés principaux
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {channelDetails.top_keywords.map((kw: string, i: number) => (
                        <span key={i} className="bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-sm">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Strengths */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-emerald-500" /> Leurs points forts
                    </h3>
                    <ul className="space-y-2">
                      {channelDetails.strengths.map((strength: string, i: number) => (
                        <li key={i} className="flex items-start gap-3 bg-[#2a2b30] p-3 rounded-lg border border-slate-700">
                          <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="text-slate-300 text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-amber-500" /> Solutions pour améliorer votre chaîne
                    </h3>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                      <ul className="space-y-3">
                        {channelDetails.recommendations.map((rec: string, i: number) => (
                          <li key={i} className="flex items-start gap-3">
                            <div className="bg-amber-500 text-amber-950 rounded-full w-6 h-6 flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                              {i + 1}
                            </div>
                            <span className="text-amber-100 text-sm leading-relaxed">{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center text-red-400 py-10">
                  Erreur lors du chargement des données.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
