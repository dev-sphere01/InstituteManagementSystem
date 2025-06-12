import React from 'react';
import { useThemeStore } from '../../store';
import Cards from './components/Cards';
import Graphs from './components/Graphs';

const Dashboard = () => {
  const { isDarkMode } = useThemeStore();

  return (
    <div>
      {/* Header Section */}
      <div className="mb-8">
        <h1 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            Dashboard
          </span>
        </h1>
        <p className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>
          Welcome to your dashboard. Here's an overview of your key metrics.
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
        {/* Users Card */}
        <div className={`group relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
          isDarkMode
            ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/30 border border-blue-700/50 shadow-lg'
            : 'bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-md'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-blue-800/50' : 'bg-blue-200'} transition-colors duration-300`}>
              <svg className={`w-6 h-6 ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-blue-300' : 'text-blue-600'}`}>+12%</span>
          </div>
          <h2 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-300`}>
            Total Users
          </h2>
          <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>
            1,234
          </p>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Active this month
          </p>
        </div>

        {/* Revenue Card */}
        <div className={`group relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
          isDarkMode
            ? 'bg-gradient-to-br from-green-900/50 to-green-800/30 border border-green-700/50 shadow-lg'
            : 'bg-gradient-to-br from-green-50 to-green-100 border border-green-200 shadow-md'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-green-800/50' : 'bg-green-200'} transition-colors duration-300`}>
              <svg className={`w-6 h-6 ${isDarkMode ? 'text-green-300' : 'text-green-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-green-300' : 'text-green-600'}`}>+8%</span>
          </div>
          <h2 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-300`}>
            Revenue
          </h2>
          <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>
            $5,678
          </p>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            This month
          </p>
        </div>

        {/* Orders Card */}
        <div className={`group relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
          isDarkMode
            ? 'bg-gradient-to-br from-purple-900/50 to-purple-800/30 border border-purple-700/50 shadow-lg'
            : 'bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 shadow-md'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-lg ${isDarkMode ? 'bg-purple-800/50' : 'bg-purple-200'} transition-colors duration-300`}>
              <svg className={`w-6 h-6 ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <span className={`text-sm font-medium ${isDarkMode ? 'text-purple-300' : 'text-purple-600'}`}>+15%</span>
          </div>
          <h2 className={`text-lg font-semibold mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-300`}>
            Orders
          </h2>
          <p className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>
            9,012
          </p>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Total orders
          </p>
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="mt-12">
        <h2 className={`text-xl font-semibold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-800'} transition-colors duration-300`}>
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className={`p-4 rounded-lg border transition-all duration-300 hover:scale-105 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}>
            <div className="text-center">
              <svg className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="text-sm font-medium">Add User</span>
            </div>
          </button>

          <button className={`p-4 rounded-lg border transition-all duration-300 hover:scale-105 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}>
            <div className="text-center">
              <svg className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-green-400' : 'text-green-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-medium">View Reports</span>
            </div>
          </button>

          <button className={`p-4 rounded-lg border transition-all duration-300 hover:scale-105 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}>
            <div className="text-center">
              <svg className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-purple-400' : 'text-purple-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-medium">Settings</span>
            </div>
          </button>

          <button className={`p-4 rounded-lg border transition-all duration-300 hover:scale-105 ${
            isDarkMode
              ? 'bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}>
            <div className="text-center">
              <svg className={`w-8 h-8 mx-auto mb-2 ${isDarkMode ? 'text-orange-400' : 'text-orange-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-medium">Help</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
