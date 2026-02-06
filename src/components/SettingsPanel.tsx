import { useState } from 'react';
import { XMarkIcon, SwatchIcon, GlobeAltIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { translations, Language } from '../locales';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  autoFetch: boolean;
  setAutoFetch: (enabled: boolean) => void;
}

export function SettingsPanel({
  isOpen, onClose,
  language, setLanguage,
  theme, setTheme,
  autoFetch, setAutoFetch
}: SettingsPanelProps) {
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'downloader'>('general');
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-[500px] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-200">{t.settings}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Body - Sidebar + Content */}
        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <div className="w-32 bg-zinc-50/50 dark:bg-zinc-950/30 border-r border-zinc-100 dark:border-zinc-800 p-2 space-y-1">
            <button 
              onClick={() => setActiveTab('general')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${activeTab === 'general' ? 'bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              <GlobeAltIcon className="w-4 h-4" /> {t.general}
            </button>
            <button 
              onClick={() => setActiveTab('appearance')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${activeTab === 'appearance' ? 'bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              <SwatchIcon className="w-4 h-4" /> {t.appearance}
            </button>
            <button 
              onClick={() => setActiveTab('downloader')}
              className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg transition-colors ${activeTab === 'downloader' ? 'bg-zinc-100 dark:bg-zinc-800 text-blue-600 dark:text-blue-400' : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              <ArrowDownTrayIcon className="w-4 h-4" /> {t.downloader}
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-5 overflow-y-auto">
            
            {activeTab === 'general' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t.language}</label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as Language)}
                    className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-blue-600"
                  >
                    <option value="en">English</option>
                    <option value="ja">日本語</option>
                    <option value="ko">한국어</option>
                    <option value="zh">中文</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t.theme}</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={() => setTheme('dark')}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${theme === 'dark' ? 'bg-zinc-800 border-blue-600 text-blue-400' : 'bg-zinc-50/50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-600'}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-zinc-950 mb-2 border border-blue-600/30"></div>
                      <span className="text-xs font-medium">{t.dark}</span>
                    </button>
                    <button 
                      onClick={() => setTheme('light')}
                      className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${theme === 'light' ? 'bg-white border-blue-600 text-blue-600 shadow-sm' : 'bg-zinc-50/50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-300 dark:hover:border-zinc-600'}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-zinc-100 mb-2 border border-blue-600/30"></div>
                      <span className="text-xs font-medium">{t.light}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'downloader' && (
              <div className="space-y-6">
                
                {/* Auto Fetch */}
                <div className="flex items-start justify-between">
                  <div className="space-y-0.5">
                    <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{t.autoFetch}</div>
                    <p className="text-[10px] text-zinc-500">{t.autoFetchDesc}</p>
                  </div>
                  <button 
                    onClick={() => setAutoFetch(!autoFetch)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${autoFetch ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-700'}`}
                  >
                    <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${autoFetch ? 'translate-x-5' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>
            )}
          </div>
      </div>
    </div>
  </div>
  );
}
