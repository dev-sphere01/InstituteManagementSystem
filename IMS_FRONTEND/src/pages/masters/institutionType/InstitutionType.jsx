import React, { useState } from 'react';
import Boards from './boards/Boards';
import Universities from './universites/Universities';

const InstitutionType = () => {
  const [activeTab, setActiveTab] = useState('boards');

  return (
    <div className="space-y-4">
      {/* Header with Tabs aligned */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Heading */}
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Institution Type</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage educational boards and universities
          </p>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4">
          <button
            className={`pb-1 font-medium transition-all ${
              activeTab === 'boards'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
            onClick={() => setActiveTab('boards')}
          >
            🏫 Boards
          </button>
          <button
            className={`pb-1 font-medium transition-all ${
              activeTab === 'universities'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            }`}
            onClick={() => setActiveTab('universities')}
          >
            🎓 Universities
          </button>
        </div>
      </div>

      {/* Content */}
      <div>
        {activeTab === 'boards' && <Boards />}
        {activeTab === 'universities' && <Universities />}
      </div>
    </div>
  );
};

export default InstitutionType;
