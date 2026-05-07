import React, { useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { TrendingUp, Users, Target, DollarSign } from 'lucide-react';
import { useThemeStore } from '../../../store';
import useCrmStore from '../../../store/useCrmStore';

const STAGE_COLORS_HEX = {
  New: '#6B7280', Contacted: '#3B82F6', Warm: '#F59E0B',
  Hot: '#F97316', Converted: '#10B981', Lost: '#EF4444',
};
const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#F97316', '#8B5CF6', '#EF4444'];

function StatCard({ label, value, sub, icon: Icon, color, isDarkMode }) {
  return (
    <div className={`rounded-lg shadow-md p-5 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{label}</p>
          <p className={`text-2xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value ?? '—'}</p>
          {sub && <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{sub}</p>}
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function CrmAnalytics() {
  const { isDarkMode } = useThemeStore();
  const { pipelineStats, overallROI, campaignROI, fetchPipelineStats, fetchOverallROI, fetchCampaignROI } = useCrmStore();

  useEffect(() => {
    fetchPipelineStats();
    fetchOverallROI();
    fetchCampaignROI();
  }, []);

  const stageData = pipelineStats?.stages?.map(s => ({ name: s._id, count: s.count, fill: STAGE_COLORS_HEX[s._id] || '#6B7280' })) || [];
  const sourceData = pipelineStats?.sources?.map(s => ({ name: s._id || 'Unknown', value: s.count })) || [];
  const dailyData  = pipelineStats?.daily?.map(d => ({ date: d._id, leads: d.count })) || [];

  const axisColor = isDarkMode ? '#9CA3AF' : '#6B7280';
  const gridColor = isDarkMode ? '#374151' : '#E5E7EB';
  const cardCls = `rounded-lg shadow-md border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>CRM Analytics</h1>
        <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Lead flow, conversion rates, and ROI overview</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={overallROI?.totalLeads} icon={Users} color="bg-blue-500" isDarkMode={isDarkMode} />
        <StatCard label="Converted" value={overallROI?.converted} sub={`${overallROI?.conversionRate ?? 0}% rate`} icon={Target} color="bg-green-500" isDarkMode={isDarkMode} />
        <StatCard label="Cost Per Lead" value={overallROI?.cpl ? `₹${overallROI.cpl}` : '—'} icon={DollarSign} color="bg-yellow-500" isDarkMode={isDarkMode} />
        <StatCard label="Cost Per Acquisition" value={overallROI?.cpa ? `₹${overallROI.cpa}` : '—'} icon={TrendingUp} color="bg-purple-500" isDarkMode={isDarkMode} />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Stage distribution bar */}
        <div className={`${cardCls} p-5`}>
          <h3 className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Leads by Stage</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stageData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="name" tick={{ fill: axisColor, fontSize: 11 }} />
              <YAxis tick={{ fill: axisColor, fontSize: 11 }} />
              <Tooltip contentStyle={{ background: isDarkMode ? '#1F2937' : '#fff', border: `1px solid ${gridColor}`, borderRadius: 8 }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {stageData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Source pie */}
        <div className={`${cardCls} p-5`}>
          <h3 className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Leads by Source</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={sourceData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {sourceData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: isDarkMode ? '#1F2937' : '#fff', border: `1px solid ${gridColor}`, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Daily trend */}
      <div className={`${cardCls} p-5`}>
        <h3 className={`text-sm font-semibold mb-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Lead Inflow — Last 30 Days</h3>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={dailyData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="date" tick={{ fill: axisColor, fontSize: 10 }} />
            <YAxis tick={{ fill: axisColor, fontSize: 11 }} />
            <Tooltip contentStyle={{ background: isDarkMode ? '#1F2937' : '#fff', border: `1px solid ${gridColor}`, borderRadius: 8 }} />
            <Line type="monotone" dataKey="leads" stroke="#3B82F6" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Campaign ROI table */}
      {campaignROI.length > 0 && (
        <div className={`${cardCls} overflow-hidden`}>
          <div className={`px-5 py-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`text-sm font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>Campaign ROI</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  {['Campaign', 'Channel', 'Budget', 'Leads', 'Conversions', 'Conv. Rate', 'CPL', 'CPA'].map(h => (
                    <th key={h} className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wide ${isDarkMode ? 'text-gray-300' : 'text-gray-500'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {campaignROI.map(c => (
                  <tr key={c._id} className={`transition-colors ${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'}`}>
                    <td className={`px-4 py-3 text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{c.name}</td>
                    <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{c.channel}</td>
                    <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>₹{c.budget?.toLocaleString()}</td>
                    <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{c.totalLeads}</td>
                    <td className="px-4 py-3 text-sm text-green-600 font-medium">{c.conversions}</td>
                    <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{c.conversionRate}%</td>
                    <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{c.cpl ? `₹${c.cpl}` : '—'}</td>
                    <td className={`px-4 py-3 text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>{c.cpa ? `₹${c.cpa}` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
