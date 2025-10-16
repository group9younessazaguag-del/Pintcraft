
import React, { useState } from 'react';
import type { AdminSettings } from '../../types';
import RichTextEditor from '../RichTextEditor';
import PageIcon from '../icons/PageIcon';
import ChevronDownIcon from '../icons/ChevronDownIcon';

interface AdminPageProps {
  isAdminLoggedIn: boolean;
  setIsAdminLoggedIn: (isLoggedIn: boolean) => void;
  settings: AdminSettings;
  setSettings: (settings: AdminSettings) => void;
}

const Accordion: React.FC<{ title: string; children: React.ReactNode; initialOpen?: boolean }> = ({ title, children, initialOpen = false }) => {
    const [isOpen, setIsOpen] = useState(initialOpen);
    return (
        <div className="border border-slate-200 rounded-lg">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center p-4 bg-slate-50 rounded-t-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-pink-500"
            >
                <h3 className="text-lg font-semibold text-slate-700">{title}</h3>
                <ChevronDownIcon className={`w-6 h-6 text-slate-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="p-4 border-t border-slate-200">
                    {children}
                </div>
            )}
        </div>
    );
};


const AdminPage: React.FC<AdminPageProps> = ({ isAdminLoggedIn, setIsAdminLoggedIn, settings, setSettings }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [localSettings, setLocalSettings] = useState<AdminSettings>(settings);
  const [saveStatus, setSaveStatus] = useState<{[key: string]: 'saved' | 'saving' | null}>({});

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === (process.env.REACT_APP_ADMIN_PASSWORD || '399xz3ff')) {
      setIsAdminLoggedIn(true);
      setError('');
    } else {
      setError('Incorrect password.');
    }
  };

  const handleSettingsChange = (field: keyof AdminSettings, value: string) => {
    setLocalSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSavePageContent = (field: keyof AdminSettings) => {
    setSaveStatus(prev => ({...prev, [field]: 'saving'}));
    const newSettings = { ...settings, [field]: localSettings[field] };
    setSettings(newSettings);
    setTimeout(() => {
        setSaveStatus(prev => ({...prev, [field]: 'saved'}));
        setTimeout(() => setSaveStatus(prev => ({...prev, [field]: null})), 2000);
    }, 500);
  };

  const handleSaveAllSettings = () => {
    setSettings(localSettings);
    alert('Site configuration saved!');
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
  
  const renderSaveButton = (field: keyof AdminSettings) => {
    const status = saveStatus[field];
    if (status === 'saving') {
        return (
            <span className="text-sm font-semibold text-slate-500">Saving...</span>
        );
    }
    if (status === 'saved') {
         return (
            <span className="text-sm font-semibold text-green-600">Saved!</span>
        );
    }
    return (
        <button
            onClick={() => handleSavePageContent(field)}
            className="px-5 py-2 bg-slate-700 text-white font-semibold text-sm rounded-lg shadow-sm hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
        >
            Save
        </button>
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

        <div className="space-y-6 pt-6 border-t border-slate-200">
            <h2 className="text-xl font-semibold text-slate-700">Site Configuration</h2>
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
            <div>
                <label htmlFor="boardList" className="block text-sm font-medium text-slate-600 mb-1.5">Pinterest Board List</label>
                <textarea
                    id="boardList"
                    value={localSettings.boardList}
                    onChange={(e) => handleSettingsChange('boardList', e.target.value)}
                    rows={5}
                    placeholder="Enter one board name per line"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <p className="text-xs text-slate-500 mt-1.5">Enter one board name per line. The AI Content Generator will choose the most relevant board from this list.</p>
            </div>
            <div>
                <label htmlFor="categoryList" className="block text-sm font-medium text-slate-600 mb-1.5">Recipe Category List</label>
                <textarea
                    id="categoryList"
                    value={localSettings.categoryList}
                    onChange={(e) => handleSettingsChange('categoryList', e.target.value)}
                    rows={5}
                    placeholder="Enter one category per line (e.g., Appetizer, Main Course, Dessert)"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-500"
                />
                <p className="text-xs text-slate-500 mt-1.5">Enter one category per line. The AI will choose the most relevant category from this list for each recipe.</p>
            </div>
             <div className="text-right">
                <button onClick={handleSaveAllSettings} className="px-6 py-2 bg-pink-500 text-white font-semibold rounded-lg shadow-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500">
                    Save Site Config
                </button>
            </div>
        </div>
        
        <div className="space-y-6 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-3">
                <PageIcon className="w-6 h-6 text-slate-500" />
                <h2 className="text-xl font-semibold text-slate-700">Page Content Management</h2>
            </div>
            <p className="text-sm text-slate-500 -mt-4">Edit the content for the static pages on your site. Use the toolbar for basic formatting. Each page saves individually.</p>
            
            <div className="space-y-4">
                 <Accordion title="How to Use Page">
                     <RichTextEditor label="" value={localSettings.howToUsePageContent} onChange={(v) => handleSettingsChange('howToUsePageContent', v)} />
                     <div className="text-right mt-3">{renderSaveButton('howToUsePageContent')}</div>
                </Accordion>
                <Accordion title="About Page">
                    <RichTextEditor label="" value={localSettings.aboutPageContent} onChange={(v) => handleSettingsChange('aboutPageContent', v)} />
                    <div className="text-right mt-3">{renderSaveButton('aboutPageContent')}</div>
                </Accordion>
                 <Accordion title="Contact Page">
                     <RichTextEditor label="" value={localSettings.contactPageContent} onChange={(v) => handleSettingsChange('contactPageContent', v)} />
                     <div className="text-right mt-3">{renderSaveButton('contactPageContent')}</div>
                </Accordion>
                <Accordion title="Terms of Service Page">
                    <RichTextEditor label="" value={localSettings.termsPageContent} onChange={(v) => handleSettingsChange('termsPageContent', v)} />
                    <div className="text-right mt-3">{renderSaveButton('termsPageContent')}</div>
                </Accordion>
                 <Accordion title="Privacy Policy Page">
                     <RichTextEditor label="" value={localSettings.privacyPageContent} onChange={(v) => handleSettingsChange('privacyPageContent', v)} />
                     <div className="text-right mt-3">{renderSaveButton('privacyPageContent')}</div>
                </Accordion>
            </div>
        </div>
        
      </div>
    </div>
  );
};

export default AdminPage;
