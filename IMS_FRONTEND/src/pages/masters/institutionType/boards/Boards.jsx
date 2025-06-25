import React, { useEffect, useState } from 'react';
import API from '../../../../services/API';
import { useNotification } from '../../../../services/NotificationService';
import AddBoard from './components/AddBoards';
import EditBoard from './components/EditBoards';
import AllBoards from './components/AllBoards';
import { useThemeStore } from '../../../../store';

const BoardMaster = () => {
  const notify = useNotification();
  const { isDarkMode } = useThemeStore();

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingBoard, setEditingBoard] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'add'

  const fetchBoards = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/boards');
      setBoards(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load boards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBoards();
  }, []);

  const handleBoardCreated = (newBoard) => {
    setBoards((prev) => [newBoard, ...prev]);
    setActiveTab('all');
  };

  const handleBoardUpdated = async (updatedBoard) => {
    try {
      const res = await API.put(`/boards/${updatedBoard._id}`, updatedBoard);
      setBoards((prev) =>
        prev.map((b) => (b._id === updatedBoard._id ? res.data.data : b))
      );
      setEditingBoard(null);
      notify('Board updated successfully', 'success');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update board', 'error');
    }
  };

  const handleDeleteBoard = async (id) => {
    try {
      await API.delete(`/boards/${id}`);
      setBoards((prev) => prev.filter((b) => b._id !== id));
      notify('Board deleted successfully', 'success');
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to delete board', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="mb-2">
        <h1 className="text-2xl font-bold">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Board Master</span>
        </h1>
        <p className="text-sm text-gray-400">
          Manage all academic boards in the system
        </p>
      </div>

      {/* Tabs */}
      <div className={`border-b  ${isDarkMode ? 'border-gray-700' : 'border-gray-200'} flex space-x-6 text-sm font-medium `}>
        <button
          className={`flex items-center gap-1 py-2 px-2 border-b-2 ${
            activeTab === 'all'
              ? 'border-blue-500 text-blue-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
          onClick={() => {
            setEditingBoard(null);
            setActiveTab('all');
          }}
        >
          📋 All Boards
        </button>
        <button
          className={`flex items-center gap-1 py-2 px-2 border-b-2 ${
            activeTab === 'add'
              ? 'border-purple-500 text-purple-400'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
          onClick={() => {
            setEditingBoard(null);
            setActiveTab('add');
          }}
        >
          ➕ Add Board
        </button>
      </div>

      {/* Main Content */}
      <div>
        {editingBoard ? (
          <EditBoard
            board={editingBoard}
            onCancel={() => setEditingBoard(null)}
            onBoardUpdated={handleBoardUpdated}
          />
        ) : activeTab === 'add' ? (
          <AddBoard
            onCancel={() => setActiveTab('all')}
            onBoardCreated={handleBoardCreated}
          />
        ) : (
          <AllBoards
            boards={boards}
            onEditBoard={(board) => {
              setEditingBoard(board);
              setActiveTab('');
            }}
            onDeleteBoard={handleDeleteBoard}
            loading={loading}
            error={error}
          />
        )}
      </div>
    </div>
  );
};

export default BoardMaster;
