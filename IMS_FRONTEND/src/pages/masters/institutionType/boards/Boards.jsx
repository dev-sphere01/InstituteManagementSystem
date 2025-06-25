import React, { useEffect, useState } from 'react';
import API from '../../../../services/API';
import { useNotification } from '../../../../services/NotificationService';
import AddBoard from './components/AddBoards';
import EditBoard from './components/EditBoards';
import AllBoards from './components/AllBoards';

const BoardMaster = () => {
  const notify = useNotification();

  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingBoard, setEditingBoard] = useState(null);
  const [adding, setAdding] = useState(false);

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
      {!adding && !editingBoard && (
        <div className="flex justify-end">
          <button
            onClick={() => setAdding(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md font-medium shadow"
          >
            ➕ Add Board
          </button>
        </div>
      )}

      {adding && (
        <AddBoard
          onCancel={() => setAdding(false)}
          onBoardCreated={handleBoardCreated}
        />
      )}

      {editingBoard && (
        <EditBoard
          board={editingBoard}
          onCancel={() => setEditingBoard(null)}
          onBoardUpdated={handleBoardUpdated}
        />
      )}

      {!adding && !editingBoard && (
        <AllBoards
          boards={boards}
          onEditBoard={(board) => setEditingBoard(board)}
          onDeleteBoard={handleDeleteBoard}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
};

export default BoardMaster;
