// src/pages/SettingsPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Trash2 } from 'lucide-react';
import PasswordInput from '../components/PasswordInput';
import PasswordStrengthValidator from '../components/PasswordStrengthValidator';
function SettingsPage({ refreshAuth }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // Password form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordStrength, setNewPasswordStrength] = useState(0);
  const handleNewPasswordChange = (e) => {
    const newPwd = e.target.value;
    setNewPassword(newPwd);
    setNewPasswordStrength(PasswordStrengthValidator.calculateStrength(newPwd));
  };
  // Fetch user on mount
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/me', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        } else {
          navigate('/login');
        }
      } catch (err) {
        console.error('Error fetching user:', err);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);
  const handleSaveChanges = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      setSuccess('No changes to save.');
      setTimeout(() => setSuccess(''), 3000);
      return;
    }
    if (!PasswordStrengthValidator.isValid(newPassword)) {
      setError(PasswordStrengthValidator.getErrorMessage());
      return;
    }
    setSaveLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
        credentials: 'include',
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: 'An unknown error occurred' }));
        throw new Error(json.error || 'Failed to change password');
      }
      // Logout after password change to force re-login
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
      setSuccess('Password changed successfully! Logging you out...');
      setCurrentPassword('');
      setNewPassword('');
      setTimeout(() => {
        if (refreshAuth) refreshAuth();
        navigate('/login');
      }, 1500);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 5000);
    } finally {
      setSaveLoading(false);
    }
  };
  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch('/api/delete-account', {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: 'An unknown error occurred' }));
        alert(json.error || 'Failed to delete account');
        return;
      }
      // Logout after deletion (todos and embeddings already deleted in backend)
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
      setSuccess('Account deleted successfully. Redirecting to login...');
      setTimeout(() => {
        if (refreshAuth) refreshAuth();
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error('Error deleting account:', err);
      alert('An error occurred while deleting the account.');
    }
  };
  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }
  if (!user) {
    return null; // Redirect handled in useEffect
  }
  return (
    <div className="flex flex-col max-w-4xl mx-auto bg-custom-bg min-h-screen">
      {/* Profile Header */}
      <div className="flex flex-wrap justify-between gap-3 p-4 mb-6">
        <p className="text-[#111618] dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">Settings</p>
      </div>
      <div className="flex p-4 mb-6">
        <div className="flex w-full flex-col gap-4 @[520px]:flex-row @[520px]:justify-between @[520px]:items-center">
          <div className="flex gap-4 items-center">
            <div className="flex flex-col justify-center">
              <p className="text-[#111618] dark:text-white text-[22px] font-bold leading-tight tracking-[-0.015em]">{user.username}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Profile Fields (Read-only) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 mb-8">
        <label className="flex flex-col min-w-40 flex-1">
          <p className="text-[#111618] dark:text-white text-base font-medium leading-normal pb-2">User Name</p>
          <input
            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg text-[#111618] dark:text-white focus:outline-0 focus:ring-0 border border-[#dbe4e6] dark:border-gray-600 bg-white dark:bg-gray-800 focus:border-primary h-14 placeholder:text-[#618389] p-[15px] text-base font-normal leading-normal cursor-not-allowed"
            value={user.username}
            readOnly
          />
        </label>
      </div>
      {/* Change Password Section */}
      <div className="p-4 mb-8">
        <h2 className="text-xl font-bold text-[#111618] dark:text-white mb-4 flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Change Password
        </h2>
        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border border-red-300 dark:border-red-700">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-3 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg border border-green-300 dark:border-green-700">
            {success}
          </div>
        )}
        <form onSubmit={handleSaveChanges}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PasswordInput
              label="Current Password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              showStrength={false}
            />
            <PasswordInput
              label="New Password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={handleNewPasswordChange}
              required
              showStrength={true}
              strength={newPasswordStrength}
            />
          </div>
        </form>
      </div>
      {/* Save Changes Button */}
      <div className="flex justify-end p-4">
        <button
          onClick={handleSaveChanges}
          disabled={saveLoading || !newPassword || !PasswordStrengthValidator.isValid(newPassword)}
          className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary text-white bg-blue-500 text-base font-bold leading-normal tracking-[0.015em] hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="truncate">{saveLoading ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>
      {/* Danger Zone - Delete Account */}
      <div className="p-4 mt-8 border-t border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10 rounded-lg">
        <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
          <Trash2 className="h-5 w-5" />
          Danger Zone
        </h2>
        <p className="text-red-600 dark:text-red-400 mb-4">Delete your account and all associated data.</p>
        <button
          onClick={handleDeleteAccount}
          className="flex min-w-[120px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-red-500 text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-red-600"
        >
          <span className="truncate">Delete Account</span>
        </button>
      </div>
    </div>
  );
}
export default SettingsPage;