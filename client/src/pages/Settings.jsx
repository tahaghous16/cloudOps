import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Shield, Key, CheckCircle, AlertCircle, AlertTriangle, Settings as SettingsIcon } from 'lucide-react';

export default function Settings() {
  const { user, updateProfile } = useApp();

  // Profile Form State
  const [nameInput, setNameInput] = useState(user?.name || '');
  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState(false);
  const [securityError, setSecurityError] = useState('');

  // Handle Profile Update
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);

    if (!nameInput || !emailInput) {
      setProfileError('Please enter a valid name and email address.');
      return;
    }

    updateProfile(nameInput, emailInput);
    setProfileSuccess(true);
    
    // Auto clear success message
    setTimeout(() => {
      setProfileSuccess(false);
    }, 3000);
  };

  // Handle Password Update
  const handleSecuritySubmit = (e) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess(false);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setSecurityError('Please fill in all password fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setSecurityError('New password must be at least 6 characters long.');
      return;
    }

    // Mock successful password reset
    setSecuritySuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');

    // Auto clear success message
    setTimeout(() => {
      setSecuritySuccess(false);
    }, 3000);
  };

  return (
    <div className="space-y-6.5">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">System Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Configure profile details and security properties.</p>
      </div>

      {/* Info Banner */}
      <div className="flex items-center gap-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 p-4 rounded-xl text-xs leading-relaxed">
        <AlertTriangle className="w-4.5 h-4.5 shrink-0 text-sky-400" />
        <span>
          <strong>Backend Notice:</strong> Profile updates and password reset endpoints are not supported by the backend yet. These settings will persist locally in the session.
        </span>
      </div>

      {/* Two Column Forms */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6.5">
        {/* Profile Settings */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-5 border-b border-slate-800/80 pb-4">
            <User className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-semibold text-white">Administrator Profile</h2>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {profileSuccess && (
              <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-lg text-xs font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>Profile details updated successfully.</span>
              </div>
            )}

            {profileError && (
              <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-lg text-xs font-semibold">
                <AlertCircle className="w-4 h-4" />
                <span>{profileError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 rounded-lg text-slate-205 focus:outline-none focus:border-sky-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 rounded-lg text-slate-205 focus:outline-none focus:border-sky-500 text-sm"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-semibold rounded-lg shadow-lg cursor-pointer text-sm"
            >
              Save Profile
            </button>
          </form>
        </div>

        {/* Security / Password Settings */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-5 border-b border-slate-800/80 pb-4">
            <Key className="w-5 h-5 text-sky-400" />
            <h2 className="text-base font-semibold text-white">Security Credentials</h2>
          </div>

          <form onSubmit={handleSecuritySubmit} className="space-y-4">
            {securitySuccess && (
              <div className="flex items-center gap-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3.5 rounded-lg text-xs font-semibold">
                <CheckCircle className="w-4 h-4" />
                <span>Account password modified successfully.</span>
              </div>
            )}

            {securityError && (
              <div className="flex items-center gap-2.5 bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-lg text-xs font-semibold">
                <AlertCircle className="w-4 h-4" />
                <span>{securityError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Current Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 rounded-lg text-slate-205 focus:outline-none focus:border-sky-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 rounded-lg text-slate-205 focus:outline-none focus:border-sky-500 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-955 border border-slate-800 rounded-lg text-slate-205 focus:outline-none focus:border-sky-500 text-sm"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-semibold rounded-lg shadow-lg cursor-pointer text-sm"
            >
              Update Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
