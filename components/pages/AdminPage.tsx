import React, { useState, useEffect } from 'react';
import type { AdminSettings } from '../../types';
import SettingsIcon from '../icons/SettingsIcon';
import BulkIcon from '../icons/BulkIcon';

interface AdminPageProps {
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (value: boolean) => void;
  settings: AdminSettings;
  setSettings: (settings: AdminSettings) => void;
}

// This is a simple client-side password. For a real application,
// this should be handled by a secure backend authentication system.
// To change the password, you can change this value.
const ADMIN_PASSWORD = 'admin_password_123';

const AdminPage: React.FC<AdminPageProps> = ({ isAdminLoggedIn, setIsAdminLoggedIn, settings, setSettings }) => {
  const [passwordInput, setPasswordInput] = useState('');
  const [error, setError] = useState('');
  const [localSettings, setLocalSettings] = useState<AdminSettings>(settings);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setIsAdminLoggedIn(true);
      setError('');
    } else {
      setError('Incorrect password. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setPasswordInput('');
  };

  const handleSettingsChange = (field: keyof AdminSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = () => {
    setSettings(localSettings);
    setSaveMessage('Settings saved successfully!');
    setTimeout(() => setSaveMessage(''), 3000);
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="container mx-auto max-w-md py-12 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200/80">
          <h1 className="text-2xl font-bold text-slate-800 text-center mb-6">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-1.5">Password</label>
              <input
                type="password"
                id="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="Enter admin password"
                autoComplete="current-password"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              className="w-full px-4 py-2.5 bg-slate-800 text-white font-semibold rounded-lg shadow-md hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-300"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-800">Admin Panel</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors"
        >
          Logout
        </button>
      </div>

      <div className="space-y-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 text-slate-500"><SettingsIcon /></div>
            <h3 className="text-md font-semibold text-slate-800 tracking-tight">Analytics & Ads Configuration</h3>
          </div>
          <div className="space-y-4 pt-4 border-t border-slate-200/80">
            <div>
              <label htmlFor="analyticsId" className="block text-sm font-medium text-slate-600 mb-1.5">Google Analytics ID</label>
              <input
                type="text"
                id="analyticsId"
                value={localSettings.analyticsId}
                onChange={(e) => handleSettingsChange('analyticsId', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="e.g., G-XXXXXXXXXX"
              />
            </div>
            <div>
              <label htmlFor="adsId" className="block text-sm font-medium text-slate-600 mb-1.5">Google Ads ID</label>
              <input
                type="text"
                id="adsId"
                value={localSettings.adsId}
                onChange={(e) => handleSettingsChange('adsId', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="e.g., AW-XXXXXXXXX"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200/80 space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 text-slate-500"><BulkIcon /></div>
            <h3 className="text-md font-semibold text-slate-800 tracking-tight">AdSense Monetization</h3>
          </div>
          <div className="space-y-4 pt-4 border-t border-slate-200/80">
            <div className="flex items-center justify-between">
                <label htmlFor="showAds" className="text-sm font-medium text-slate-600">Show Ad Banner</label>
                <button
                    type="button"
                    onClick={() => handleSettingsChange('showAds', !localSettings.showAds)}
                    className={`${
                        localSettings.showAds ? 'bg-green-500' : 'bg-slate-300'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2`}
                    role="switch"
                    aria-checked={localSettings.showAds}
                >
                    <span
                    aria-hidden="true"
                    className={`${
                        localSettings.showAds ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                </button>
            </div>
            <div>
              <label htmlFor="adClient" className="block text-sm font-medium text-slate-600 mb-1.5">AdSense Client ID</label>
              <input
                type="text"
                id="adClient"
                value={localSettings.adClient}
                onChange={(e) => handleSettingsChange('adClient', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="e.g., ca-pub-XXXXXXXXXXXXXXXX"
              />
            </div>
            <div>
              <label htmlFor="adSlot" className="block text-sm font-medium text-slate-600 mb-1.5">AdSense Slot ID</label>
              <input
                type="text"
                id="adSlot"
                value={localSettings.adSlot}
                onChange={(e) => handleSettingsChange('adSlot', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                placeholder="e.g., 1234567890"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          {saveMessage && <p className="text-sm font-medium text-green-600">{saveMessage}</p>}
          <button
            onClick={handleSaveSettings}
            className="px-6 py-2.5 bg-pink-500 text-white font-semibold rounded-lg shadow-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-all duration-300"
          >
            Save All Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
