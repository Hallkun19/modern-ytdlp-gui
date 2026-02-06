import { BoltIcon, QueueListIcon, Cog6ToothIcon } from "@heroicons/react/24/outline";
import { translations, Language } from "../locales";

interface NavbarProps {
  activeTab: "quick" | "queue";
  onTabChange: (tab: "quick" | "queue") => void;
  onSettingsClick: () => void;
  language: Language;
}

export function Navbar({ activeTab, onTabChange, onSettingsClick, language }: NavbarProps) {
  const t = translations[language];

  return (
    <nav className="w-full border-b border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 py-4 px-6 mb-8 relative">
      <div className="flex items-center justify-between">
        {/* Logo Area */}
        <div className="flex items-center gap-3 w-32">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
            <img src="/ModernDownloaderIcon.png" className="w-full h-full object-contain" alt="Logo" />
          </div>
          <h1 className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            ModernDL
          </h1>
        </div>

        {/* Tab Switcher - Centered */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="flex bg-zinc-100 dark:bg-zinc-900 rounded-lg p-1 border border-zinc-200 dark:border-zinc-800 gap-1">
            <button
                onClick={() => onTabChange("quick")}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 ${
                activeTab === "quick" ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
            >
                <BoltIcon className="w-3.5 h-3.5" /> {t.quickMode}
            </button>
            <button
                onClick={() => onTabChange("queue")}
                className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-2 ${
                activeTab === "queue" ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-white shadow-sm" : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                }`}
            >
                <QueueListIcon className="w-3.5 h-3.5" /> {t.queueMode}
            </button>
            </div>
        </div>

        {/* Settings Button */}
        <div className="w-32 flex justify-end">
            <button 
                onClick={onSettingsClick}
                className="p-2 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-lg transition-colors"
                title={t.settings}
            >
                <Cog6ToothIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
    </nav>
  );
}
