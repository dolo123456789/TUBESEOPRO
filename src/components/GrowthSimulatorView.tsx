import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Users, Play, Loader2, Sparkles, Bot, ArrowRight } from 'lucide-react';
import { ProGatedView } from './ProGatedView';

export function GrowthSimulatorView({ setActiveTab }: { setActiveTab: (tab: string) => void }) {
  const [currentSubs, setCurrentSubs] = useState(1000);
  const [avgViews, setAvgViews] = useState(500);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationData, setSimulationData] = useState<any[]>([]);

  const runSimulation = () => {
    setIsSimulating(true);
    // Simulate growth over 12 months with a "magic" exponential factor
    setTimeout(() => {
      const data = [];
      let subs = currentSubs;
      let views = avgViews;
      const growthFactor = 1.25; // 25% monthly growth in "magic" mode

      for (let i = 0; i <= 12; i++) {
        data.push({
          month: `Mois ${i}`,
          subscribers: Math.round(subs),
          views: Math.round(views),
        });
        subs *= growthFactor;
        views *= (growthFactor + 0.05); // Views grow slightly faster
      }
      setSimulationData(data);
      setIsSimulating(false);
    }, 1500);
  };

  return (
    <ProGatedView 
      title="Simulateur de Croissance" 
      description="Utilisez nos algorithmes prédictifs pour simuler la croissance de votre chaîne sur 12 mois et obtenir des conseils stratégiques."
      setActiveTab={setActiveTab}
    >
      <div className="space-y-6">
      <div className="bg-white dark:bg-[#1a1b20] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <Bot className="h-6 w-6 text-indigo-500" />
          Simulateur de Croissance et Trafic YouTube (IA)
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Simulez la croissance de votre chaîne en utilisant nos algorithmes prédictifs basés sur l'IA.
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Abonnés actuels</label>
            <input
              type="number"
              value={currentSubs}
              onChange={(e) => setCurrentSubs(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Vues moyennes par vidéo</label>
            <input
              type="number"
              value={avgViews}
              onChange={(e) => setAvgViews(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0f1115] text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={runSimulation}
              disabled={isSimulating}
              className="w-full px-6 py-2 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center justify-center gap-2 h-[42px]"
            >
              {isSimulating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
              Lancer la Simulation
            </button>
          </div>
        </div>

        {simulationData.length > 0 && (
          <div className="space-y-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-50 dark:bg-[#0f1115] p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Projection des Abonnés (12 mois)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={simulationData}>
                      <defs>
                        <linearGradient id="colorSubs" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="subscribers" stroke="#6366f1" fillOpacity={1} fill="url(#colorSubs)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-[#0f1115] p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Projection des Vues (12 mois)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={simulationData}>
                      <defs>
                        <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', backgroundColor: '#1e293b', color: '#fff' }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Area type="monotone" dataKey="views" stroke="#10b981" fillOpacity={1} fill="url(#colorViews)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="bg-indigo-600 rounded-2xl p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold mb-1">Résultat de la Simulation</h3>
                <p className="text-indigo-100 text-sm">En suivant la stratégie "Optimisée", vous pourriez atteindre <span className="font-bold text-white">{simulationData[12]?.subscribers?.toLocaleString() || 'N/A'}</span> abonnés en un an.</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-indigo-200 uppercase font-bold tracking-wider">Croissance Totale</p>
                <p className="text-3xl font-black">+{simulationData[12] ? Math.round((simulationData[12].subscribers / currentSubs - 1) * 100) : 0}%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
    </ProGatedView>
  );
}
