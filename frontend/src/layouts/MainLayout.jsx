import React from 'react';
import { Home, PlusCircle, History, Sliders, ShoppingBag } from 'lucide-react';
import Navbar from '../components/Navbar';

export default function MainLayout({
  children,
  activeTab,
  setActiveTab,
  theme,
  toggleTheme,
}) {
  const mobileNavItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'create', label: 'Create', icon: PlusCircle },
    { id: 'history', label: 'History', icon: History },
    { id: 'preferences', label: 'Memory', icon: Sliders },
  ];

  return (
    <div className="app-container">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      <main className="main-content">{children}</main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav" id="mobile-nav">
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              id={`mobile-nav-${item.id}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
