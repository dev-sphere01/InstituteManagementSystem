import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import API from '../../../services/API';

const ChangePassword = () => {
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSkip = () => {
    navigate('/dashboard/student');
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    if (!oldPassword || !password || !confirmPassword) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    try {
      await API.auth.changePassword(oldPassword, password);
      navigate('/dashboard/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h2 className="text-2xl font-bold mb-4">Change Your Password</h2>
      <p className="mb-6 text-gray-600">Your password is system-generated. For security, please change it now or you can skip and continue.</p>
      <form className="w-full max-w-xs" onSubmit={handleChangePassword}>
        <input
          type="password"
          className="mb-3 w-full px-3 py-2 border rounded"
          placeholder="Old Password"
          value={oldPassword}
          onChange={e => setOldPassword(e.target.value)}
          required
        />
        <input
          type="password"
          className="mb-3 w-full px-3 py-2 border rounded"
          placeholder="New Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          className="mb-3 w-full px-3 py-2 border rounded"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mb-2"
          disabled={isLoading}
        >
          {isLoading ? 'Changing...' : 'Change Password'}
        </button>
        {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
      </form>
      <button
        className="mt-2 px-6 py-2 bg-gray-300 hover:bg-gray-400 rounded text-gray-800"
        onClick={handleSkip}
      >
        Skip for now
      </button>
    </div>
  )
}

export default ChangePassword