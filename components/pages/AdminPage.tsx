import React, { useState } from 'react';
import type { AdminSettings } from '../../types';
import RichTextEditor from '../RichTextEditor';

interface AdminPageProps {
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (isLoggedIn: boolean) => void;
  settings: AdminSettings;
  setSettings: (settings: AdminSettings) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ isAdminLoggedIn, setIsAdminLoggedIn, settings, setSettings }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [localSettings, setLocalSettings] = useState<AdminSettings>(settings);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would be a secure check.
    // For this example, we'll use an environment variable or a simple hardcoded password.
    if (password === (process.env.REACT_APP_ADMIN_PASSWORD || 'admin123')) {
      setIsAdminLoggedIn(true);
      setError('');
    } else {
      setError('Incorrect password.');
    }
  };

  const handleSettingsChange = (field: keyof AdminSettings, value: string) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveSettings = () => {
    setSettings(localSettings);
    alert('Settings saved!');
  };

  if (!isAdminLoggedIn) {
    return (
      <div className="container mx-auto max-w-md py-12 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200/80">
          <h1 className="text-2xl font-bold text-center text-slate-800 mb-6">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-600 mb-1.5">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="w-full px-4 py-2.5 bg-slate-800 text-white font-semibold rounded-lg shadow-md hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
              Login
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-slate-200/80 space-y-8">
        <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">Admin Panel</h1>
            <button
                onClick={() => setIsAdminLoggedIn(false)}
                className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors"
            >
                Logout
            </button>
        </div>

        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-700 border-b border-slate-200 pb-2">Site Configuration</h2>
            <div>
                <label htmlFor="analyticsId" className="block text-sm font-medium text-slate-600 mb-1.5">Google Analytics ID</label>
                <input
                    type="text"
                    id="analyticsId"
                    value={localSettings.analyticsId}
                    onChange={(e) => handleSettingsChange('analyticsId', e.target.value)}
                    placeholder="e.g., G-XXXXXXXXXX"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
            </div>
            <div>
                <label htmlFor="adScript" className="block text-sm font-medium text-slate-600 mb-1.5">Ad Banner Script</label>
                <textarea
                    id="adScript"
                    value={localSettings.adScript}
                    onChange={(e) => handleSettingsChange('adScript', e.target.value)}
                    rows={5}
                    placeholder="Paste your ad provider's script tag here"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500 font-mono text-sm"
                />
            </div>
        </div>
        
        <div className="space-y-6">
            <h2 className="text-xl font-semibold text-slate-700 border-b border-slate-200 pb-2">Page Content</h2>
            <p className="text-sm text-slate-500">Edit the content for the static pages on your site. Use the toolbar for basic formatting.</p>
            
            <RichTextEditor label="About Page" value={localSettings.aboutPageContent} onChange={(v) => handleSettingsChange('aboutPageContent', v)} />
            <RichTextEditor label="Contact Page" value={localSettings.contactPageContent} onChange={(v) => handleSettingsChange('contactPageContent', v)} />
            <RichTextEditor label="How to Use Page" value={localSettings.howToUsePageContent} onChange={(v) => handleSettingsChange('howToUsePageContent', v)} />
            <RichTextEditor label="Privacy Policy Page" value={localSettings.privacyPageContent} onChange={(v) => handleSettingsChange('privacyPageContent', v)} />
            <RichTextEditor label="Terms of Service Page" value={localSettings.termsPageContent} onChange={(v) => handleSettingsChange('termsPageContent', v)} />

        </div>
        
        <div className="pt-6 border-t border-slate-200 text-right">
            <button onClick={handleSaveSettings} className="px-6 py-2.5 bg-pink-500 text-white font-semibold rounded-lg shadow-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                Save All Settings
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
