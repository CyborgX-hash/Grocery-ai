import React, { useState } from 'react';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import CreateListPage from './pages/CreateListPage';
import ReviewPage from './pages/ReviewPage';
import ShoppingListPage from './pages/ShoppingListPage';
import HistoryPage from './pages/HistoryPage';
import PreferencesPage from './pages/PreferencesPage';
import { useTheme } from './hooks/useTheme';

export default function App() {
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('home');
  const [parsedData, setParsedData] = useState(null);
  const [activeListId, setActiveListId] = useState(null);
  const [triggerDemoInitial, setTriggerDemoInitial] = useState(false);

  const handleNavigate = (tab, options = {}) => {
    if (options.triggerDemo) {
      setTriggerDemoInitial(true);
    } else {
      setTriggerDemoInitial(false);
    }
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleParsedComplete = (data) => {
    setParsedData(data);
    setActiveTab('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveSuccess = (listId) => {
    setActiveListId(listId);
    setActiveTab('shopping');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenList = (listId) => {
    setActiveListId(listId);
    setActiveTab('shopping');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <MainLayout
      activeTab={activeTab}
      setActiveTab={handleNavigate}
      theme={theme}
      toggleTheme={toggleTheme}
    >
      {activeTab === 'home' && (
        <HomePage
          onNavigate={handleNavigate}
          onOpenList={handleOpenList}
        />
      )}

      {activeTab === 'create' && (
        <CreateListPage
          onParsedComplete={handleParsedComplete}
          initialDemo={triggerDemoInitial}
        />
      )}

      {activeTab === 'review' && (
        <ReviewPage
          parsedData={parsedData}
          onSaveSuccess={handleSaveSuccess}
          onBack={() => setActiveTab('create')}
        />
      )}

      {activeTab === 'shopping' && (
        <ShoppingListPage
          listId={activeListId}
          onBack={() => setActiveTab('history')}
          onNavigate={handleNavigate}
        />
      )}

      {activeTab === 'history' && (
        <HistoryPage
          onOpenList={handleOpenList}
          onNavigate={handleNavigate}
        />
      )}

      {activeTab === 'preferences' && (
        <PreferencesPage />
      )}
    </MainLayout>
  );
}
