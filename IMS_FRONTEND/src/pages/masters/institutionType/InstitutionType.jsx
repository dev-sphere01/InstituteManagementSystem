import React, { useState } from 'react';
import Boards from './boards/Boards';
import Universities from './universites/Universities';

const InstitutionType = () => {
  const [activeTab, setActiveTab] = useState('boards');

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary mb-1">Institution Type</h2>
          <p className="text-sm text-muted-foreground">Manage educational boards and universities</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-border">
        <button
          className={`pb-2 font-medium transition-all ${
            activeTab === 'boards'
              ? 'text-accent border-b-2 border-accent'
              : 'text-muted-foreground hover:text-accent'
          }`}
          onClick={() => setActiveTab('boards')}
        >
          🏫 Boards
        </button>
        <button
          className={`pb-2 font-medium transition-all ${
            activeTab === 'universities'
              ? 'text-accent border-b-2 border-accent'
              : 'text-muted-foreground hover:text-accent'
          }`}
          onClick={() => setActiveTab('universities')}
        >
          🎓 Universities
        </button>
      </div>

      {/* Content */}
      {activeTab === 'boards' && <Boards />}
      {activeTab === 'universities' && <Universities />}
    </div>
  );
};

export default InstitutionType;
