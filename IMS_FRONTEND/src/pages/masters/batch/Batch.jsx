import React, { useState } from 'react';
import { useThemeStore } from '../../../store';
import AddBatch from './components/AddBatch';
import AllBatches from './components/AllBatches';
import EditBatch from './components/EditBatch';

// Mock data for demonstration
const initialBatches = [
  {
    _id: '1',
    centreCode: 'C001',
    batchTiming: '9:00 AM - 11:00 AM',
    subject: 'Mathematics',
    course: 'BSc',
    teacherName: 'John Doe',
  },
  {
    _id: '2',
    centreCode: 'C002',
    batchTiming: '11:00 AM - 1:00 PM',
    subject: 'Physics',
    course: 'BSc',
    teacherName: 'Jane Smith',
  },
];

const Batch = () => {
  const { isDarkMode } = useThemeStore();
  const [activeTab, setActiveTab] = useState('all');
  const [batches, setBatches] = useState(initialBatches);
  const [editingBatch, setEditingBatch] = useState(null);

  const tabs = [
    { id: 'all', label: 'All Batches', icon: '📋' },
    { id: 'add', label: 'Add Batch', icon: '➕' },
  ];

  const handleEditBatch = (batch) => {
    setEditingBatch(batch);
    setActiveTab('edit');
  };

  const handleCloseEdit = () => {
    setEditingBatch(null);
    setActiveTab('all');
  };

  const handleBatchCreated = (newBatch) => {
    setBatches([...batches, { ...newBatch, _id: (batches.length + 1).toString() }]);
    setActiveTab('all');
  };

  const handleBatchUpdated = (updatedBatch) => {
    setBatches(batches.map((b) => (b._id === updatedBatch._id ? updatedBatch : b)));
    setEditingBatch(null);
    setActiveTab('all');
  };

  const handleBatchDeleted = (id) => {
    setBatches(batches.filter((b) => b._id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}> 
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
              Batch Master
            </span>
          </h1>
          <p className={`mt-2 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Manage all batches in the system</p>
        </div>
      </div>

      {/* Tabs */}
      <div className={`border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}> 
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === tab.id
                  ? `border-blue-500 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`
                  : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} hover:border-gray-300`
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
          {editingBatch && (
            <button
              onClick={() => setActiveTab('edit')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'edit'
                  ? `border-blue-500 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`
                  : `border-transparent ${isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'} hover:border-gray-300`
              }`}
            >
              <span className="mr-2">✏️</span>
              Edit Batch
            </button>
          )}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'all' && (
          <AllBatches
            batches={batches}
            onEditBatch={handleEditBatch}
            onDeleteBatch={handleBatchDeleted}
          />
        )}
        {activeTab === 'add' && (
          <AddBatch onBatchCreated={handleBatchCreated} onCancel={() => setActiveTab('all')} />
        )}
        {activeTab === 'edit' && editingBatch && (
          <EditBatch
            batch={editingBatch}
            onBatchUpdated={handleBatchUpdated}
            onClose={handleCloseEdit}
          />
        )}
      </div>
    </div>
  );
};

export default Batch;