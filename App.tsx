import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
import GeneratorInterface from './components/GeneratorInterface';
import AboutPage from './components/pages/AboutPage';
import PrivacyPolicyPage from './components/pages/PrivacyPolicyPage';
import TermsOfServicePage from './components/pages/TermsOfServicePage';
import AdminPage from './components/pages/AdminPage';
import UpgradePage from './components/pages/UpgradePage';
import AdBanner from './components/AdBanner';

import useLocalStorage from './hooks/useLocalStorage';
import useUser from './hooks/useUser';
import { useAnalytics } from './hooks/useAnalytics';
import type { AdminSettings } from './types';

const AppContent: React.FC<{
  settings: AdminSettings;
  setSettings: (s: AdminSettings) => void;
}> = ({ settings, setSettings }) => {
  const location = useLocation();
  useAnalytics(settings.analyticsId);

  const [isAdminLoggedIn, setIsAdminLoggedIn] = useLocalStorage<boolean>('pin4you-admin', false);
  const { user, upgradeToPro } = useUser();

  const handleUpgrade = () => {
    // In a real app this would route to a payment flow
    upgradeToPro();
    alert("You've been upgraded to Pro!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      <Header userIsPro={user.isPro} onUpgradeClick={handleUpgrade} />
      {location.pathname === '/' && settings.adScript && <AdBanner adScript={settings.adScript} />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<GeneratorInterface />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/terms" element={<TermsOfServicePage />} />
          <Route path="/upgrade" element={<UpgradePage />} />
          <Route path="/admin" element={
            <AdminPage 
              isAdminLoggedIn={isAdminLoggedIn} 
              setIsAdminLoggedIn={setIsAdminLoggedIn}
              settings={settings}
              setSettings={setSettings}
            />
          }/>
        </Routes>
      </main>
      <Footer />
    </div>
  );
};


const App: React.FC = () => {
  const [settings, setSettings] = useLocalStorage<AdminSettings>('pin4you-settings', {
    analyticsId: '',
    adScript: '',
  });

  return (
    <Router>
      <AppContent settings={settings} setSettings={setSettings} />
    </Router>
  );
};

export default App;
