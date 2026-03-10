import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Search, Video } from 'lucide-react';

const data7Days = [
  { name: 'Mon', views: 4000, subs: 24 },
  { name: 'Tue', views: 3000, subs: 13 },
  { name: 'Wed', views: 2000, subs: 98 },
  { name: 'Thu', views: 2780, subs: 39 },
  { name: 'Fri', views: 1890, subs: 48 },
  { name: 'Sat', views: 2390, subs: 38 },
  { name: 'Sun', views: 3490, subs: 43 },
];

const data30Days = [
  { name: 'Week 1', views: 25000, subs: 150 },
  { name: 'Week 2', views: 32000, subs: 210 },
  { name: 'Week 3', views: 28000, subs: 180 },
  { name: 'Week 4', views: 45000, subs: 320 },
];

export function DashboardView() {
  const [timeRange, setTimeRange] = useState<'7' | '30'>('7');
  const currentData = timeRange === '7' ? data7Days : data30Days;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Performance Overview</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Real-time analytics for your YouTube channel.</p>
        </div>
        <div className="flex items-center gap-2 bg-white dark:bg-[#1a1b20] p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button 
            onClick={() => setTimeRange('7')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              timeRange === '7' 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Last 7 Days
          </button>
          <button 
            onClick={() => setTimeRange('30')}
            className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
              timeRange === '30' 
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Last 30 Days
          </button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Views', value: timeRange === '7' ? '2.4M' : '10.2M', icon: Video, trend: '+12.5%', color: 'indigo' },
          { title: 'Subscribers', value: timeRange === '7' ? '142K' : '158K', icon: Users, trend: '+4.2%', color: 'emerald' },
          { title: 'Avg. SEO Score', value: '84/100', icon: Search, trend: '+2.1%', color: 'amber' },
          { title: 'Viral Potential', value: 'High', icon: TrendingUp, trend: 'Stable', color: 'violet' },
        ].map((stat) => (
          <div key={stat.title} className="group relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b20] p-6 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
            <div className={`absolute top-0 right-0 -mr-4 -mt-4 h-24 w-24 rounded-full bg-${stat.color}-500/5 blur-2xl group-hover:bg-${stat.color}-500/10 transition-colors`} />
            
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                stat.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
              }`}>
                {stat.trend}
              </span>
            </div>
            
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b20] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{timeRange === '7' ? 'Weekly' : 'Monthly'} Traffic</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-indigo-500" />
                <span className="text-xs font-medium text-slate-500">Views</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-violet-500" />
                <span className="text-xs font-medium text-slate-500">Subscribers</span>
              </div>
            </div>
          </div>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={currentData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 500 }} 
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white dark:bg-[#0f1115] border border-slate-200 dark:border-slate-800 p-3 rounded-xl shadow-2xl">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">{payload[0].payload.name}</p>
                          <div className="space-y-1">
                            {payload.map((p: any, i: number) => (
                              <div key={i} className="flex items-center gap-4 justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{p.name}</span>
                                </div>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{p.value.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="views" name="Views" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={timeRange === '7' ? 32 : 64} />
                <Bar dataKey="subs" name="Subscribers" fill="#8b5cf6" radius={[6, 6, 0, 0]} barSize={timeRange === '7' ? 32 : 64} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b20] p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Audits</h3>
            <button className="text-xs font-bold text-indigo-600 hover:text-indigo-500 transition-colors">View All</button>
          </div>
          <div className="space-y-5">
            {[
              { title: 'How to Learn React in 2024', score: 92, status: 'Excellent', date: '2h ago' },
              { title: 'My Desk Setup Tour', score: 68, status: 'Needs Work', date: '5h ago' },
              { title: '10 Tips for Better Code', score: 85, status: 'Good', date: '1d ago' },
              { title: 'Why I Switched to Neovim', score: 74, status: 'Fair', date: '2d ago' },
              { title: 'Mastering Tailwind CSS', score: 88, status: 'Good', date: '3d ago' },
            ].map((video, i) => (
              <div key={i} className="group flex items-center justify-between border-b border-slate-100 dark:border-slate-800/50 pb-4 last:border-0 last:pb-0">
                <div className="flex-1 min-w-0 pr-4">
                  <p className="font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 transition-colors">{video.title}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{video.date} • Score: {video.score}/100</p>
                </div>
                <div className={`h-2 w-2 rounded-full shrink-0 ${
                  video.score >= 85 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                  video.score >= 70 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                  'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                }`} />
              </div>
            ))}
          </div>
          
          <div className="mt-8 p-4 rounded-xl bg-slate-50 dark:bg-[#0f1115] border border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-1.5 rounded-lg bg-indigo-500 text-white">
                <TrendingUp className="h-4 w-4" />
              </div>
              <p className="text-xs font-bold text-slate-900 dark:text-white">AI Insight</p>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Your "React 2024" video is performing 40% better than average. Consider making a follow-up video on Next.js.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
