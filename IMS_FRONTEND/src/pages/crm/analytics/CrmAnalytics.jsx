import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, Users, Target, DollarSign, Award, Trophy,
  Zap, Calendar, Plus, RefreshCw, Send, CheckCircle, AlertCircle, Sparkles, ChevronRight
} from 'lucide-react';
import { useThemeStore } from '../../../store';
import useCrmStore from '../../../store/useCrmStore';
import API from '../../../services/API';

// Mock campaigns with financial figures for Marketing ROI Dashboard
const initialCampaigns = [
  { _id: 'c1', name: 'Meta Summer Admissions 2026', channel: 'Meta', budget: 150000, leads: 450, conversions: 112, revenue: 672000, isActive: true },
  { _id: 'c2', name: 'Google High-Intent Search', channel: 'Google', budget: 180000, leads: 320, conversions: 88, revenue: 580000, isActive: true },
  { _id: 'c3', name: 'Lucknow Walk-in Seminar', channel: 'Offline', budget: 80000, leads: 150, conversions: 42, revenue: 294000, isActive: true },
  { _id: 'c4', name: 'Student Referral Network', channel: 'Referral', budget: 20000, leads: 180, conversions: 38, revenue: 210000, isActive: true },
  { _id: 'c5', name: 'Meta Retargeting Campaign', channel: 'Meta', budget: 50000, leads: 120, conversions: 14, revenue: 70000, isActive: false },
  { _id: 'c6', name: 'Local Print Media Ads', channel: 'Offline', budget: 40000, leads: 25, conversions: 2, revenue: 24000, isActive: false }
];

// Mock counsellors for Sales & Competition Dashboard
const initialCounsellors = [
  {
    id: 's1',
    name: 'Priya Sharma',
    avatar: '👩‍💼',
    assigned: 95,
    stages: { Cold: 25, Warm: 32, Hot: 10, Converted: 28, Lost: 0 },
    followupsDue: 4,
    conversions: 28,
    revenue: 224000,
    speed: 12, // average response time in minutes
    badge: '🏆 Golden Closer',
    badgeDesc: 'Highest conversion rate & fastest speed',
    followups: [
      { id: 'f1', name: 'Rohan Deshmukh', course: "O'Level", stage: 'Hot', phone: '9827364521', time: '11:30 AM' },
      { id: 'f2', name: 'Ankita Verma', course: 'Advance Excel', stage: 'Warm', phone: '9182736452', time: '02:15 PM' },
      { id: 'f3', name: 'Sameer Sen', course: 'Python', stage: 'Hot', phone: '9081726354', time: '03:45 PM' }
    ]
  },
  {
    id: 's2',
    name: 'Amit Singh',
    avatar: '👨‍💼',
    assigned: 110,
    stages: { Cold: 40, Warm: 30, Hot: 8, Converted: 32, Lost: 0 },
    followupsDue: 7,
    conversions: 32,
    revenue: 256000,
    speed: 18,
    badge: '💰 Revenue Champion',
    badgeDesc: 'Highest total fees converted',
    followups: [
      { id: 'f4', name: 'Vikram Seth', course: 'Data Science', stage: 'Hot', phone: '9372819201', time: '10:00 AM' },
      { id: 'f5', name: 'Shreya Roy', course: 'Web Development', stage: 'Warm', phone: '9928374829', time: '12:30 PM' },
      { id: 'f6', name: 'Kabir Das', course: 'CCC', stage: 'Warm', phone: '9012384729', time: '04:00 PM' }
    ]
  },
  {
    id: 's3',
    name: 'Neha Gupta',
    avatar: '👩‍💻',
    assigned: 80,
    stages: { Cold: 35, Warm: 18, Hot: 7, Converted: 20, Lost: 0 },
    followupsDue: 2,
    conversions: 20,
    revenue: 160000,
    speed: 9,
    badge: '⚡ Speed Demon',
    badgeDesc: 'Avg. response time under 10 minutes',
    followups: [
      { id: 'f7', name: 'Manish Tyagi', course: 'Graphic Design', stage: 'Hot', phone: '9837492810', time: '01:00 PM' },
      { id: 'f8', name: 'Ritika Goel', course: 'Tally', stage: 'Warm', phone: '9482938491', time: '05:30 PM' }
    ]
  }
];

const PIE_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#F97316', '#8B5CF6', '#EF4444'];
const STAGE_COLORS = { Cold: 'bg-blue-500', Warm: 'bg-yellow-500', Hot: 'bg-orange-500', Converted: 'bg-green-500', Lost: 'bg-red-500' };

export default function CrmAnalytics() {
  const { isDarkMode } = useThemeStore();
  
  // Tabs and toggles state
  const [activeTab, setActiveTab] = useState('roi'); // 'roi' (6.4) or 'sales' (6.5)
  const [salesView, setSalesView] = useState('individual'); // 'individual' or 'leaderboard'
  
  // Data State
  const [campaigns, setCampaigns] = useState(initialCampaigns);
  const [counsellors, setCounsellors] = useState(initialCounsellors);
  const [selectedCounsellorId, setSelectedCounsellorId] = useState('s1');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (activeTab === 'roi') {
        const res = await API.crm.campaigns.getROI();
        if (res.success && res.data) {
          setCampaigns(res.data);
        }
      } else if (activeTab === 'sales') {
        const res = await API.reports.getSalesCompetition();
        if (res.success && res.data) {
          setCounsellors(res.data);
          if (res.data.length > 0) {
            const currentExists = res.data.some(c => c.id === selectedCounsellorId);
            if (!currentExists) {
              setSelectedCounsellorId(res.data[0].id);
            }
          }
        }
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to sync live analytics data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [activeTab]);
  
  // Competition settings state
  const [congratsMsg, setCongratsMsg] = useState("Outstanding hustle Priya! Gold Closer badge unlocked! Keep setting standards!");
  const [activeBulletinMsg, setActiveBulletinMsg] = useState("Let's hit our monthly milestone! High closers receive customized perks next weekend!");
  const [rewardTitle, setRewardTitle] = useState("Performer of the Month");
  const [rewardAmount, setRewardAmount] = useState("5,000");
  const [activeReward, setActiveReward] = useState({ title: "Performer of the Month", amount: "5,000" });
  
  // Interactive Simulation variables
  const [showSimulateModal, setShowSimulateModal] = useState(false);
  const [simName, setSimName] = useState('');
  const [simChannel, setSimChannel] = useState('Meta');
  const [simBudget, setSimBudget] = useState('100000');
  const [simLeads, setSimLeads] = useState('300');
  const [simConversions, setSimConversions] = useState('60');
  const [simRevenue, setSimRevenue] = useState('450000');

  // Sorting for Leaderboard
  const [leaderboardSortBy, setLeaderboardSortBy] = useState('conversions'); // 'conversions', 'revenue', 'speed'
  
  // Celebrations / Confetti state
  const [confettiActive, setConfettiActive] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);
  const [winnerCelebrationData, setWinnerCelebrationData] = useState(null);

  // Auto scroll/cleanup for confetti
  useEffect(() => {
    if (confettiActive) {
      const timer = setTimeout(() => setConfettiActive(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [confettiActive]);

  // Handle Simulation submit
  const handleSimulateSubmit = (e) => {
    e.preventDefault();
    if (!simName.trim()) return;
    const newCamp = {
      _id: 'sim-' + Date.now(),
      name: simName,
      channel: simChannel,
      budget: Number(simBudget) || 0,
      leads: Number(simLeads) || 0,
      conversions: Number(simConversions) || 0,
      revenue: Number(simRevenue) || 0,
      isActive: true
    };
    setCampaigns(prev => [newCamp, ...prev]);
    setShowSimulateModal(false);
    // Reset fields
    setSimName('');
    setSimBudget('100000');
    setSimLeads('300');
    setSimConversions('60');
    setSimRevenue('450000');
  };

  // Convert lead handler in Individual tab
  const handleConvertLead = (counsellorId, followupId, leadName) => {
    // Confetti effect
    setConfettiActive(true);
    setWinnerCelebrationData({ leadName, counsellorId });
    setShowWinnerModal(true);

    // Update state to increment conversion
    setCounsellors(prev => prev.map(c => {
      if (c.id === counsellorId) {
        const remainingFollowups = c.followups.filter(f => f.id !== followupId);
        const updatedStages = { ...c.stages, Converted: c.stages.Converted + 1, Hot: c.stages.Hot - 1 };
        return {
          ...c,
          conversions: c.conversions + 1,
          revenue: c.revenue + 8000, // assume avg admission fee
          followupsDue: Math.max(0, c.followupsDue - 1),
          stages: updatedStages,
          followups: remainingFollowups
        };
      }
      return c;
    }));
  };

  // Compute values for Marketing ROI Tab (Module 6.4)
  const totalCampaignsBudget = campaigns.reduce((acc, c) => acc + (c.budget || 0), 0);
  const totalCampaignsLeads = campaigns.reduce((acc, c) => acc + (c.leads || 0), 0);
  const totalCampaignsConversions = campaigns.reduce((acc, c) => acc + (c.conversions || 0), 0);
  const totalCampaignsRevenue = campaigns.reduce((acc, c) => acc + (c.revenue || 0), 0);
  const overallCPL = totalCampaignsLeads > 0 ? Math.round(totalCampaignsBudget / totalCampaignsLeads) : 0;
  const overallCPA = totalCampaignsConversions > 0 ? Math.round(totalCampaignsBudget / totalCampaignsConversions) : 0;
  const overallROIPercent = totalCampaignsBudget > 0 ? Math.round(((totalCampaignsRevenue - totalCampaignsBudget) / totalCampaignsBudget) * 100) : 0;

  // Chart data formatting
  const channelChartData = Object.values(campaigns.reduce((acc, c) => {
    if (!acc[c.channel]) {
      acc[c.channel] = { name: c.channel, budget: 0, revenue: 0, leads: 0, conversions: 0 };
    }
    acc[c.channel].budget += c.budget || 0;
    acc[c.channel].revenue += c.revenue || 0;
    acc[c.channel].leads += c.leads || 0;
    acc[c.channel].conversions += c.conversions || 0;
    return acc;
  }, {})).map(item => ({
    ...item,
    roi: item.budget > 0 ? Math.round(((item.revenue - item.budget) / item.budget) * 100) : 0
  }));

  // Selected Counsellor for individual view
  const currentCounsellor = counsellors.find(c => c.id === selectedCounsellorId) || counsellors[0];

  // Leaderboard sorting logic
  const sortedLeaderboard = [...counsellors].sort((a, b) => {
    if (leaderboardSortBy === 'revenue') return b.revenue - a.revenue;
    if (leaderboardSortBy === 'speed') return a.speed - b.speed; // lower minutes = better
    return b.conversions - a.conversions; // default: conversions
  });

  const cardCls = `rounded-xl shadow-lg border p-6 ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-900'}`;
  const inputCls = `block w-full px-3 py-2 border rounded-md shadow-sm text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
    isDarkMode ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' : 'border-gray-300 bg-white text-gray-900'
  }`;
  
  return (
    <div className="space-y-6 relative overflow-x-hidden p-1">
      {/* Dynamic CSS Confetti Generator */}
      {confettiActive && (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
          {[...Array(50)].map((_, i) => {
            const randomX = Math.random() * 100;
            const randomDelay = Math.random() * 3;
            const randomColor = PIE_COLORS[Math.floor(Math.random() * PIE_COLORS.length)];
            return (
              <div
                key={i}
                className="absolute w-2 h-4 rounded-sm animate-bounce opacity-75"
                style={{
                  left: `${randomX}%`,
                  top: `-10px`,
                  backgroundColor: randomColor,
                  transform: `rotate(${Math.random() * 360}deg)`,
                  animation: `fall 4s linear infinite`,
                  animationDelay: `${randomDelay}s`
                }}
              />
            );
          })}
          <style>{`
            @keyframes fall {
              0% { top: -10px; transform: translateY(0) rotate(0deg); }
              100% { top: 100%; transform: translateY(900px) rotate(360deg); }
            }
          `}</style>
        </div>
      )}

      {/* Heading Block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-extrabold tracking-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            CRM Analytics & Performance
          </h1>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Analyze marketing spend effectiveness (ROI) and track sales incentives, leaderboards, and accomplishments.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-gray-100 dark:bg-gray-700 p-1.5 rounded-xl border dark:border-gray-600 self-start md:self-center">
          <button
            onClick={() => setActiveTab('roi')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'roi'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="h-4 w-4" /> Marketing Campaign ROI
          </button>
          <button
            onClick={() => setActiveTab('sales')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
              activeTab === 'sales'
                ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Trophy className="h-4 w-4" /> Sales & Competition Hub
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin mb-3" />
          <p className="text-sm font-semibold text-gray-505">Synchronizing live crm analytics from database...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 text-red-500 bg-white dark:bg-gray-800 rounded-xl shadow-lg border dark:border-gray-700">
          <AlertCircle className="h-8 w-8 mb-3 text-red-500" />
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={fetchAnalyticsData}
            className="mt-4 flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-xs px-4 py-2 rounded-xl shadow cursor-pointer"
          >
            <RefreshCw className="h-3 w-3" /> Retry Sync
          </button>
        </div>
      ) : (
        <>
          {/* 🟢 TAB 1: MARKETING CAMPAIGN ROI ANALYTICS (MODULE 6.4) */}
          {activeTab === 'roi' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          {/* ROI KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={cardCls}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>Campaign Spend</span>
                <span className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><DollarSign className="h-4 w-4" /></span>
              </div>
              <p className="text-2xl font-bold mt-2">₹{totalCampaignsBudget.toLocaleString()}</p>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{campaigns.length} campaigns tracked</p>
            </div>

            <div className={cardCls}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>Total Conversions</span>
                <span className="p-2 bg-green-500/10 text-green-500 rounded-lg"><CheckCircle className="h-4 w-4" /></span>
              </div>
              <p className="text-2xl font-bold mt-2">{totalCampaignsConversions}</p>
              <p className="text-xs mt-1 text-green-600 font-semibold flex items-center gap-1">
                {totalCampaignsLeads > 0 ? Math.round((totalCampaignsConversions / totalCampaignsLeads) * 100) : 0}% Admission Rate
              </p>
            </div>

            <div className={cardCls}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-400'}`}>Overall Cost (CPL / CPA)</span>
                <span className="p-2 bg-purple-500/10 text-purple-500 rounded-lg"><Users className="h-4 w-4" /></span>
              </div>
              <p className="text-2xl font-bold mt-2">₹{overallCPL} <span className="text-xs font-normal text-gray-400">CPL</span></p>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>₹{overallCPA.toLocaleString()} Avg. Cost/Admission</p>
            </div>

            <div className={`${cardCls} bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-200 dark:border-green-800`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-green-700 dark:text-green-300">Revenue & Return (ROI)</span>
                <span className="p-2 bg-green-500 text-white rounded-lg"><Sparkles className="h-4 w-4" /></span>
              </div>
              <p className="text-2xl font-bold mt-2 text-green-700 dark:text-green-300">₹{totalCampaignsRevenue.toLocaleString()}</p>
              <span className="inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-bold bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-200">
                Net ROI: +{overallROIPercent}%
              </span>
            </div>
          </div>

          {/* Interactive Simulation Panel & Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Simulation Block */}
            <div className={`${cardCls} flex flex-col justify-between`}>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-yellow-500 animate-pulse" />
                  <h3 className="font-bold text-base">Campaign ROI Sandbox Simulator</h3>
                </div>
                <p className={`text-xs mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  Simulate budgeting models client-side to forecast CPL, conversions, and expected net ROI margins.
                </p>
                <div className="space-y-3 text-xs border-y border-dashed py-3 my-3 dark:border-gray-700">
                  <div className="flex justify-between"><span>Spend Simulation:</span> <span className="font-semibold text-blue-500">Live Computed</span></div>
                  <div className="flex justify-between"><span>Revenue Multiplier:</span> <span className="font-semibold text-green-500">Dynamic</span></div>
                </div>
              </div>
              <button
                onClick={() => setShowSimulateModal(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition"
              >
                <Plus className="h-4 w-4" /> Simulate Campaign Spend
              </button>
            </div>

            {/* Recharts Analytics Displays */}
            <div className={`${cardCls} xl:col-span-2 space-y-4`}>
              <h3 className="font-bold text-base">Spend Performance By Channels</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={channelChartData} margin={{ top: 0, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDarkMode ? '#374151' : '#E5E7EB'} />
                  <XAxis dataKey="name" tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: 11 }} />
                  <YAxis tick={{ fill: isDarkMode ? '#9CA3AF' : '#6B7280', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: isDarkMode ? '#1F2937' : '#fff', border: `1px solid ${isDarkMode ? '#374151' : '#E5E7EB'}`, borderRadius: 8, color: isDarkMode ? '#fff' : '#000' }} />
                  <Legend />
                  <Bar dataKey="budget" name="Spend Budget" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="revenue" name="Revenue Earned" fill="#10B981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Campaign Table (Module 6.4 Specs) */}
          <div className={`${cardCls} overflow-hidden`}>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <h3 className="font-bold text-lg">Marketing Campaign ROI Ledger</h3>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1.5 rounded-lg border font-medium ${isDarkMode ? 'bg-gray-700 border-gray-600 text-gray-300' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                  Active Spend Cap: ₹{totalCampaignsBudget.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto -mx-6">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className={isDarkMode ? 'bg-gray-700/60' : 'bg-gray-50'}>
                  <tr>
                    {['Campaign Name', 'Channel', 'Budget', 'Leads', 'Conversions', 'CPL', 'CPA', 'Revenue', 'Net ROI', 'Status'].map(header => (
                      <th key={header} className={`px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                  {campaigns.map(c => {
                    const leadsCount = c.leads ?? c.totalLeads ?? 0;
                    const cpl = leadsCount > 0 ? Math.round((c.budget || 0) / leadsCount) : 0;
                    const cpa = c.conversions > 0 ? Math.round((c.budget || 0) / c.conversions) : 0;
                    const roi = c.budget > 0 ? Math.round((((c.revenue || 0) - c.budget) / c.budget) * 100) : 0;

                    return (
                      <tr key={c._id} className={`transition ${isDarkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50/50'}`}>
                        <td className="px-6 py-4 text-sm font-semibold max-w-[200px] truncate">{c.name || c.campaignName}</td>
                        <td className="px-6 py-4 text-sm font-medium">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            c.channel === 'Meta' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                            c.channel === 'Google' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                            c.channel === 'Offline' ? 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300' :
                            'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                          }`}>{c.channel}</span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium">₹{(c.budget || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm">{leadsCount}</td>
                        <td className="px-6 py-4 text-sm font-semibold text-green-600 dark:text-green-400">{c.conversions}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">₹{cpl}</td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">₹{cpa.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm font-bold text-gray-800 dark:text-gray-200">₹{c.revenue.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                            roi >= 150 ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' :
                            roi >= 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' :
                            'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                          }`}>
                            {roi >= 0 ? `+${roi}%` : `${roi}%`}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm">
                          <span className={`w-2 h-2 inline-block rounded-full mr-1.5 ${c.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="text-xs font-medium">{c.isActive ? 'Running' : 'Paused'}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* 🏆 TAB 2: SALES AND COMPETITION HUB (MODULE 6.5) */}
      {activeTab === 'sales' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          
          {/* Sub Navigation Controls */}
          <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700 pb-3">
            <button
              onClick={() => setSalesView('individual')}
              className={`pb-2 text-sm font-bold border-b-2 transition ${
                salesView === 'individual'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              👤 Individual Sales Dashboards
            </button>
            <button
              onClick={() => setSalesView('leaderboard')}
              className={`pb-2 text-sm font-bold border-b-2 transition ${
                salesView === 'leaderboard'
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              ⚔️ Team Competition & Badges
            </button>
          </div>

          {/* Sub-tab 1: Individual Dashboards */}
          {salesView === 'individual' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              {/* Counsellor selector grid */}
              <div className="flex flex-wrap gap-3 items-center">
                <span className={`text-sm font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Select Counsellor Dashboard:</span>
                {counsellors.map(c => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCounsellorId(c.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition flex items-center gap-2 border ${
                      selectedCounsellorId === c.id
                        ? 'bg-blue-600 border-blue-600 text-white shadow-md'
                        : isDarkMode ? 'bg-gray-800 border-gray-700 hover:bg-gray-700' : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span>{c.avatar}</span> {c.name}
                  </button>
                ))}
              </div>

              {/* Personal metrics grids */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className={cardCls}>
                  <div className="flex justify-between items-start">
                    <span className="text-xs uppercase font-semibold text-gray-400">Leads Handled</span>
                    <Users className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-2xl font-bold mt-2">{currentCounsellor.assigned}</p>
                  <p className="text-xs mt-1 text-gray-400">Active assignments</p>
                </div>

                <div className={cardCls}>
                  <div className="flex justify-between items-start">
                    <span className="text-xs uppercase font-semibold text-gray-400">Conversions</span>
                    <Target className="h-4 w-4 text-green-500" />
                  </div>
                  <p className="text-2xl font-bold mt-2">{currentCounsellor.conversions}</p>
                  <p className="text-xs mt-1 text-green-500 font-medium">
                    {Math.round((currentCounsellor.conversions / currentCounsellor.assigned) * 100)}% Conv. Rate
                  </p>
                </div>

                <div className={cardCls}>
                  <div className="flex justify-between items-start">
                    <span className="text-xs uppercase font-semibold text-gray-400">Fees Converted</span>
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold mt-2">₹{currentCounsellor.revenue.toLocaleString()}</p>
                  <p className="text-xs mt-1 text-gray-400">Attributed Admissions</p>
                </div>

                <div className={cardCls}>
                  <div className="flex justify-between items-start">
                    <span className="text-xs uppercase font-semibold text-gray-400">Followups Today</span>
                    <Zap className="h-4 w-4 text-orange-500 animate-pulse" />
                  </div>
                  <p className="text-2xl font-bold mt-2 text-orange-500">{currentCounsellor.followupsDue}</p>
                  <p className="text-xs mt-1 text-gray-400">Due before end-of-day</p>
                </div>

                <div className={`${cardCls} bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-200 dark:border-yellow-900`}>
                  <div className="flex justify-between items-start">
                    <span className="text-xs uppercase font-semibold text-yellow-700 dark:text-yellow-400">Performance Status</span>
                    <Award className="h-4 w-4 text-yellow-600" />
                  </div>
                  <p className="text-lg font-bold mt-2 text-yellow-700 dark:text-yellow-300">{currentCounsellor.badge}</p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">{currentCounsellor.badgeDesc}</p>
                </div>
              </div>

              {/* Lead Stage counts Funnel stack */}
              <div className={cardCls}>
                <h3 className="font-bold text-sm mb-4">Pipeline Distribution Stack</h3>
                <div className="h-5 flex rounded-full overflow-hidden w-full bg-gray-200 dark:bg-gray-700">
                  {Object.entries(currentCounsellor.stages).map(([stage, value]) => {
                    const pct = Math.round((value / currentCounsellor.assigned) * 100);
                    if (value === 0) return null;
                    return (
                      <div
                        key={stage}
                        className={`${STAGE_COLORS[stage]} h-full flex items-center justify-center text-[10px] text-white font-bold transition-all`}
                        style={{ width: `${pct}%` }}
                        title={`${stage}: ${value} leads (${pct}%)`}
                      >
                        {pct > 5 && `${stage} (${value})`}
                      </div>
                    );
                  })}
                </div>
                <div className="flex flex-wrap gap-4 mt-4 text-xs font-semibold justify-center">
                  {Object.entries(currentCounsellor.stages).map(([stage, value]) => (
                    <div key={stage} className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${STAGE_COLORS[stage]}`} />
                      <span className="capitalize">{stage}:</span>
                      <span className="font-bold">{value} leads</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Followups interaction (Simulates Leads conversion) */}
              <div className={cardCls}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-base">Actionable Follow-ups due today</h3>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Click Convert to simulate real-time student registration & trigger celebrations!</p>
                  </div>
                  <span className="text-xs bg-orange-500/10 text-orange-500 font-bold px-2 py-1 rounded-full animate-pulse">
                    {currentCounsellor.followupsDue} Priority Follow-ups
                  </span>
                </div>

                {currentCounsellor.followups.length === 0 ? (
                  <div className="text-center py-8 text-sm text-gray-500">
                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                    All followups completed for today!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentCounsellor.followups.map(f => (
                      <div key={f.id} className="p-4 rounded-xl border dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 space-y-3 relative overflow-hidden flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-sm">{f.name}</span>
                            <span className="text-xs text-gray-500">{f.time}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">Course Applied: <span className="font-semibold">{f.course}</span></p>
                          <p className="text-xs text-gray-400">Phone: {f.phone}</p>
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t dark:border-gray-800 mt-2">
                          <span className="text-xs px-2 py-0.5 rounded bg-orange-100 text-orange-800 font-bold dark:bg-orange-950/40 dark:text-orange-300">Hot Lead</span>
                          <button
                            onClick={() => handleConvertLead(currentCounsellor.id, f.id, f.name)}
                            className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-bold flex items-center gap-1 transition"
                          >
                            Convert to Student <ChevronRight className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Sub-tab 2: Competition Leaderboard & Achievements */}
          {salesView === 'leaderboard' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              
              {/* Top Leaderboard Podium */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                {/* 2nd Place */}
                <div className={`${cardCls} flex flex-col items-center text-center justify-between border-t-4 border-t-gray-400 relative overflow-hidden order-2 md:order-1`}>
                  <div className="absolute top-2 left-2 text-xs font-bold text-gray-400 uppercase tracking-wide">Rank #2</div>
                  <div className="my-3">
                    <span className="text-4xl">👨‍💼</span>
                    <h4 className="font-bold text-base mt-2">Amit Singh</h4>
                    <p className="text-xs text-gray-400">Counsellor & Revenue Pro</p>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-900 rounded-lg p-3 space-y-1 text-xs">
                    <div className="flex justify-between"><span>Conversions:</span> <span className="font-bold">32 admissions</span></div>
                    <div className="flex justify-between"><span>Revenue:</span> <span className="font-bold text-green-500">₹2,56,000</span></div>
                  </div>
                </div>

                {/* 1st Place Podium Card */}
                <div className={`${cardCls} flex flex-col items-center text-center justify-between border-t-4 border-t-yellow-500 relative overflow-hidden bg-gradient-to-b from-yellow-500/5 to-amber-500/5 order-1 md:order-2 shadow-yellow-500/10 shadow-2xl`}>
                  <div className="absolute top-2 left-2 text-xs font-bold text-yellow-600 dark:text-yellow-400 uppercase tracking-wide flex items-center gap-1">
                    <Trophy className="h-3.5 w-3.5 text-yellow-500 animate-bounce" /> Monthly Leader
                  </div>
                  <div className="my-4">
                    <span className="text-5xl">👩‍💼</span>
                    <h4 className="font-extrabold text-lg mt-2 text-yellow-700 dark:text-yellow-300">Priya Sharma</h4>
                    <p className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">🏆 Golden Closer</p>
                  </div>
                  <div className="w-full bg-yellow-500/10 rounded-lg p-3 space-y-1 text-xs border border-yellow-500/20">
                    <div className="flex justify-between"><span>Conversions:</span> <span className="font-bold text-yellow-700 dark:text-yellow-300">28 admissions</span></div>
                    <div className="flex justify-between"><span>Avg. Followup:</span> <span className="font-bold text-green-600 dark:text-green-400">12 minutes</span></div>
                  </div>
                </div>

                {/* 3rd Place */}
                <div className={`${cardCls} flex flex-col items-center text-center justify-between border-t-4 border-t-amber-600 relative overflow-hidden order-3`}>
                  <div className="absolute top-2 left-2 text-xs font-bold text-amber-600 uppercase tracking-wide">Rank #3</div>
                  <div className="my-3">
                    <span className="text-4xl">👩‍💻</span>
                    <h4 className="font-bold text-base mt-2">Neha Gupta</h4>
                    <p className="text-xs text-gray-400">Counsellor & Outreach Ninja</p>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-900 rounded-lg p-3 space-y-1 text-xs">
                    <div className="flex justify-between"><span>Conversions:</span> <span className="font-bold">20 admissions</span></div>
                    <div className="flex justify-between"><span>Avg. Followup:</span> <span className="font-bold text-blue-500">9 mins (Fastest!)</span></div>
                  </div>
                </div>
              </div>

              {/* Leaderboard Table (Interactive sorting) */}
              <div className={cardCls}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <h3 className="font-bold text-base flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-500" /> Active Team Rankings
                  </h3>
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg border dark:border-gray-600 self-start">
                    <button
                      onClick={() => setLeaderboardSortBy('conversions')}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                        leaderboardSortBy === 'conversions'
                          ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
                      }`}
                    >
                      By Conversions
                    </button>
                    <button
                      onClick={() => setLeaderboardSortBy('revenue')}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                        leaderboardSortBy === 'revenue'
                          ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
                      }`}
                    >
                      By Revenue
                    </button>
                    <button
                      onClick={() => setLeaderboardSortBy('speed')}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${
                        leaderboardSortBy === 'speed'
                          ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow'
                          : 'text-gray-500 dark:text-gray-400 hover:text-gray-800'
                      }`}
                    >
                      By Speed
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto -mx-6">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className={isDarkMode ? 'bg-gray-700/60' : 'bg-gray-50'}>
                      <tr>
                        {['Rank', 'Counsellor', 'Leads Assigned', 'Conversions', 'Conversion Rate', 'Revenue Collected', 'Response Time', 'Active Badge'].map(h => (
                          <th key={h} className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {sortedLeaderboard.map((c, index) => {
                        const rate = Math.round((c.conversions / c.assigned) * 100);
                        return (
                          <tr key={c.id} className={`transition ${isDarkMode ? 'hover:bg-gray-700/30' : 'hover:bg-gray-50/50'}`}>
                            <td className="px-6 py-4 text-sm font-extrabold text-blue-500">#{index + 1}</td>
                            <td className="px-6 py-4 text-sm font-semibold flex items-center gap-2">
                              <span className="text-xl">{c.avatar}</span> {c.name}
                            </td>
                            <td className="px-6 py-4 text-sm">{c.assigned} leads</td>
                            <td className="px-6 py-4 text-sm font-bold text-green-600 dark:text-green-400">{c.conversions}</td>
                            <td className="px-6 py-4 text-sm font-medium">{rate}%</td>
                            <td className="px-6 py-4 text-sm font-bold">₹{c.revenue.toLocaleString()}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-bold ${
                                c.speed <= 10 ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-300' : 'bg-gray-100 text-gray-700 dark:bg-gray-800'
                              }`}><Zap className="h-3 w-3" /> {c.speed} mins avg</span>
                            </td>
                            <td className="px-6 py-4 text-sm font-bold text-yellow-600 dark:text-yellow-400">{c.badge}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Achievement celebration customizer & Reward Stake Setup */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Customizer */}
                <div className={cardCls}>
                  <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Send className="h-4 w-4 text-blue-500" /> post Monthly Congratulations Message</h3>
                  <p className={`text-xs mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Edit the auto congratulations bulletin posted on employee dashboards.</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Congrats Bulletin Message:</label>
                      <textarea
                        rows={2}
                        value={congratsMsg}
                        onChange={e => setCongratsMsg(e.target.value)}
                        className={inputCls}
                        placeholder="Write message..."
                      />
                    </div>
                    <button
                      onClick={() => {
                        setActiveBulletinMsg(congratsMsg);
                        setConfettiActive(true);
                      }}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Sparkles className="h-4 w-4" /> Publish Announcement & Celebrate!
                    </button>
                  </div>
                </div>

                {/* Reward stakes */}
                <div className={cardCls}>
                  <h3 className="font-bold text-sm mb-3 flex items-center gap-2"><Award className="h-4 w-4 text-amber-500" /> Reward Entry & Stakes Configuration</h3>
                  <p className={`text-xs mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Define cash incentives or items stakes mapped to the leaderboards.</p>
                  
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Incentive Category:</label>
                      <input
                        value={rewardTitle}
                        onChange={e => setRewardTitle(e.target.value)}
                        className={inputCls}
                        placeholder="e.g. Monthly Top Closer"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-400 mb-1">Cash Bounty (₹):</label>
                      <input
                        type="text"
                        value={rewardAmount}
                        onChange={e => setRewardAmount(e.target.value)}
                        className={inputCls}
                        placeholder="e.g. 5000"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveReward({ title: rewardTitle, amount: rewardAmount })}
                    className="px-4 py-2 border border-transparent bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold transition"
                  >
                    Activate Incentive Stakes
                  </button>
                </div>
              </div>

              {/* Celebratory Bulletin Board */}
              <div className={`${cardCls} bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-200 dark:border-blue-900`}>
                <div className="flex items-center gap-3">
                  <span className="p-2.5 bg-blue-600 text-white rounded-full animate-pulse"><Award className="h-5 w-5" /></span>
                  <div>
                    <h4 className="font-extrabold text-sm text-blue-700 dark:text-blue-300">Live Team Bulletin Board</h4>
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-semibold italic mt-1">"{activeBulletinMsg}"</p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-blue-500/20 flex flex-wrap justify-between items-center gap-3">
                  <span className="text-xs font-bold text-purple-600 dark:text-purple-400">⭐ Incentive Stakes: {activeReward.title} ➔ ₹{Number(activeReward.amount).toLocaleString()} Bonus!</span>
                  <span className="text-xs text-gray-400 font-semibold">Updated just now</span>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
        </>
      )}

      {/* 🔮 MODAL: SIMULATE NEW CAMPAIGN (SANDBOX ADDER) */}
      <AnimatePresence>
        {showSimulateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}
            >
              <div className="px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center">
                <h3 className="font-bold text-lg flex items-center gap-2"><Sparkles className="h-5 w-5 text-blue-500" /> Simulate Marketing Spend</h3>
                <button onClick={() => setShowSimulateModal(false)} className="text-gray-400 hover:text-white font-bold">✕</button>
              </div>

              <form onSubmit={handleSimulateSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Simulation Name</label>
                    <input
                      required
                      value={simName}
                      onChange={e => setSimName(e.target.value)}
                      placeholder="e.g. Meta Festive Camp 2026"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Marketing Channel</label>
                    <select
                      value={simChannel}
                      onChange={e => setSimChannel(e.target.value)}
                      className={inputCls}
                    >
                      {['Meta', 'Google', 'Offline', 'Referral'].map(ch => <option key={ch} value={ch}>{ch}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Spend Budget (₹)</label>
                    <input
                      type="number"
                      required
                      value={simBudget}
                      onChange={e => setSimBudget(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Leads Generated</label>
                    <input
                      type="number"
                      required
                      value={simLeads}
                      onChange={e => setSimLeads(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Conversions (Admissions)</label>
                    <input
                      type="number"
                      required
                      value={simConversions}
                      onChange={e => setSimConversions(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-400 mb-1.5">Expected Attributed Revenue (₹)</label>
                    <input
                      type="number"
                      required
                      value={simRevenue}
                      onChange={e => setSimRevenue(e.target.value)}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => setShowSimulateModal(false)}
                    className="px-4 py-2 border rounded-lg text-sm font-semibold dark:border-gray-700 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition"
                  >
                    Inject Sandbox Data
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 🎉 CELEBRATION MODAL: ADMISSION TRIGGERED! */}
      <AnimatePresence>
        {showWinnerModal && winnerCelebrationData && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className={`rounded-2xl shadow-2xl p-6 text-center max-w-sm border ${
                isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-100 text-gray-900'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-green-500/10 text-green-500 flex items-center justify-center mx-auto mb-4 animate-bounce">
                <Sparkles className="h-8 w-8 text-green-500" />
              </div>
              <h3 className="font-extrabold text-xl mb-1 text-green-600 dark:text-green-400">🎉 Admission Converted!</h3>
              <p className="text-sm font-semibold mb-3">"{winnerCelebrationData.leadName}" is now a registered Student!</p>
              
              <div className="p-3 bg-gray-100 dark:bg-gray-900 rounded-xl my-4 text-xs space-y-1">
                <div className="flex justify-between"><span>Counsellor:</span> <span className="font-bold">
                  {counsellors.find(c => c.id === winnerCelebrationData.counsellorId)?.name}
                </span></div>
                <div className="flex justify-between"><span>Revenue Triggered:</span> <span className="font-bold text-green-500">+₹8,000</span></div>
                <div className="flex justify-between"><span>Office Tasks:</span> <span className="font-bold text-blue-500">Auto Triggered ✅</span></div>
              </div>

              <button
                onClick={() => setShowWinnerModal(false)}
                className="w-full px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-bold transition"
              >
                Superb! Close & Return
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
