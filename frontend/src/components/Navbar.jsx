import React, { useEffect, useState } from 'react';
import { ShoppingBag, Sparkles, Moon, Sun, ListCheck, History, Sliders, PlusCircle } from 'lucide-react';
import { api } from '../services/api';

export default function Navbar({ activeTab, setActiveTab, theme, toggleTheme }) {
  const [aiStatus, setAiStatus] = useState(null);

  useEffect(() => {
    api.getAiStatus()
      .then(setAiStatus)
      .catch((err) => console.warn('Could not fetch AI status:', err));
  }, []);

  const navItems = [
    { id: 'home', label: 'Dashboard', icon: ShoppingBag },
    { id: 'create', label: 'Create List', icon: PlusCircle },
    { id: 'history', label: 'History', icon: History },
    { id: 'preferences', label: 'Preferences', icon: Sliders },
  ];

  return (
    <>
      <header className="navbar">
        <div className="navbar-inner">
          <button
            onClick={() => setActiveTab('home')}
            className="brand-link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            id="brand-logo-btn"
          >
            <span style={{ fontSize: '1.5rem' }}>🛒</span>
            <span>MessyList</span>
            <span className="brand-badge">AI</span>
          </button>

          <nav className="nav-links" style={{ display: 'none' }} id="desktop-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                  id={`nav-link-${item.id}`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="nav-actions">
            {aiStatus && (
              <div
                className="ai-status-pill"
                title={
                  aiStatus.isGemmaConfigured
                    ? `Connected to ${aiStatus.model}`
                    : 'Gemma API not yet provided; running in smart demo emulation mode'
                }
                id="ai-status-indicator"
              >
                <span className={`ai-status-dot ${aiStatus.mode === 'demo' ? 'demo' : ''}`} />
                <Sparkles size={12} />
                <span style={{ display: 'none' }} className="ai-label-desktop">
                  {aiStatus.mode === 'demo' ? 'Demo AI Mode' : 'Gemma AI'}
                </span>
                <span className="ai-label-mobile">
                  {aiStatus.mode === 'demo' ? 'Demo' : 'Gemma'}
                </span>
              </div>
            )}

            <button
              onClick={toggleTheme}
              className="btn-icon"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              aria-label="Toggle theme"
              id="theme-toggle-btn"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
          </div>
        </div>
      </header>

      {/* Desktop style overrides for navbar responsive display */}
      <style>{`
        @media (min-width: 768px) {
          #desktop-nav {
            display: flex !important;
          }
          .ai-label-desktop {
            display: inline !important;
          }
          .ai-label-mobile {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}
