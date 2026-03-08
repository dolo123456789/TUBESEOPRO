import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Search, Video } from 'lucide-react';

const data = [
  { name: 'Mon', views: 4000, subs: 24 },
  { name: 'Tue', views: 3000, subs: 13 },
  { name: 'Wed', views: 2000, subs: 98 },
  { name: 'Thu', views: 2780, subs: 39 },
  { name: 'Fri', views: 1890, subs: 48 },
  { name: 'Sat', views: 2390, subs: 38 },
  { name: 'Sun', views: 3490, subs: 43 },
];

export function DashboardView() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Overview</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Your channel performance at a glance.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: 'Total Views', value: '2.4M', icon: Video, trend: '+12.5%' },
          { title: 'Subscribers', value: '142K', icon: Users, trend: '+4.2%' },
          { title: 'Avg. SEO Score', value: '84/100', icon: Search, trend: '+2.1%' },
          { title: 'Viral Potential', value: 'High', icon: TrendingUp, trend: 'Stable' },
        ].map((stat) => (
          <div key={stat.title} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b20] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.title}</h3>
              <stat.icon className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{stat.value}</span>
              <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">{stat.trend}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b20] p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Weekly Performance</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                <Tooltip 
                  cursor={{ fill: '#f1f5f9' }}
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: '#fff' }}
                />
                <Bar dataKey="views" fill="#4f46e5" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1b20] p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Video Audits</h3>
          <div className="space-y-4">
            {[
              { title: 'How to Learn React in 2024', score: 92, status: 'Excellent' },
              { title: 'My Desk Setup Tour', score: 68, status: 'Needs Work' },
              { title: '10 Tips for Better Code', score: 85, status: 'Good' },
              { title: 'Why I Switched to Neovim', score: 74, status: 'Fair' },
            ].map((video, i) => (
              <div key={i} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">{video.title}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">SEO Score: {video.score}/100</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  video.score >= 85 ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-300' :
                  video.score >= 70 ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300' :
                  'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-300'
                }`}>
                  {video.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
