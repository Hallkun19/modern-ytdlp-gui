
import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { open } from "@tauri-apps/plugin-dialog";
import { 
  isPermissionGranted, 
  requestPermission, 
  sendNotification 
} from "@tauri-apps/plugin-notification";
import { onOpenUrl } from "@tauri-apps/plugin-deep-link";
import { FolderIcon } from "@heroicons/react/24/outline";

// New Components & Types
import { Layout } from "./components/Layout";
import { Navbar } from "./components/Navbar";
import { QuickDownloader } from "./components/QuickDownloader";
import { QueueManager } from "./components/QueueManager";
import { SettingsPanel } from "./components/SettingsPanel";
import { translations, Language } from "./locales";
import { VideoMetadata, QueueItem, QuickConfig, QueueConfig } from "./types";
import "./App.css";

function App() {
  const [activeTab, setActiveTab] = useState<"quick" | "queue">("quick");
  const [savePath, setSavePath] = useState("");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Settings
  const [embedMetadata, setEmbedMetadata] = useState(true);
  const [useNotifications, setUseNotifications] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [language, setLanguage] = useState<Language>('en');
  const [autoFetch, setAutoFetch] = useState(true);

  // Quick Mode State
  const [quickUrl, setQuickUrl] = useState("");
  const [quickMeta, setQuickMeta] = useState<VideoMetadata | null>(null);
  const [quickStatus, setQuickStatus] = useState<'idle' | 'fetching' | 'downloading' | 'finished' | 'error'>('idle');
  const [quickProgress, setQuickProgress] = useState("0%");
  const [quickError, setQuickError] = useState("");
  const [quickConfig, setQuickConfig] = useState<QuickConfig>({
    quality: "Highest",
    format: "mp4",
    codec: "auto",
    audioCodec: "best",
    startTime: "",
    endTime: ""
  });

  // Queue Mode State
  const [queueUrl, setQueueUrl] = useState("");
  const [queueConfig, setQueueConfig] = useState<QueueConfig>({
    quality: "1080",
    format: "mp4",
    codec: "auto",
    audioCodec: "best"
  });

  // --- Theme Effect ---
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const t = translations[language];

  // --- Quick Mode Logic ---


  const fetchQuickMeta = useCallback(async (urlOverride?: string) => {
    const targetUrl = urlOverride || quickUrl;
    if (!targetUrl) return;
    
    // Auto-fetch Gate
    if (!urlOverride && !autoFetch) return;

    setQuickStatus('fetching');
    try {
      const infoList = await invoke<VideoMetadata[]>("get_video_info", { 
        url: targetUrl
      });
      if (infoList.length > 1) {
        setQuickError("Quick Mode does not support playlists. Use Queue Mode.");
        setQuickStatus('error');
        setQuickMeta(null);
      } else if (infoList.length === 1) {
        setQuickMeta(infoList[0]);
        setQuickStatus(prev => prev === 'fetching' ? 'idle' : prev);
        setQuickError("");
      } else {
         setQuickError("No video found.");
         setQuickStatus('error');
      }
    } catch (e) {
      setQuickError(String(e));
      setQuickStatus(prev => prev === 'fetching' ? 'error' : prev);
    }
  }, [quickUrl, autoFetch]);

  // --- Persistence ---

  useEffect(() => {
    const savedSavePath = localStorage.getItem("savePath");
    const savedEmbedMeta = localStorage.getItem("embedMetadata");
    const savedNotify = localStorage.getItem("useNotifications");
    const savedQuickConfig = localStorage.getItem("quickConfig");
    const savedQueueConfig = localStorage.getItem("queueConfig");

    const savedTheme = localStorage.getItem("theme");
    const savedLang = localStorage.getItem("language");
    const savedAutoFetch = localStorage.getItem("autoFetch");

    if (savedSavePath) setSavePath(savedSavePath);
    if (savedEmbedMeta !== null) setEmbedMetadata(savedEmbedMeta === "true");
    if (savedNotify !== null) setUseNotifications(savedNotify === "true");
    if (savedTheme) setTheme(savedTheme as 'dark' | 'light');
    if (savedLang) setLanguage(savedLang as Language);
    if (savedAutoFetch !== null) setAutoFetch(savedAutoFetch === "true");
    
    if (savedQuickConfig) {
      setQuickConfig(prev => ({ ...prev, ...JSON.parse(savedQuickConfig) }));
    }
    if (savedQueueConfig) {
      setQueueConfig(prev => ({ ...prev, ...JSON.parse(savedQueueConfig) }));
    }
  }, []);

  useEffect(() => { localStorage.setItem("savePath", savePath); }, [savePath]);
  useEffect(() => { localStorage.setItem("embedMetadata", String(embedMetadata)); }, [embedMetadata]);
  useEffect(() => { localStorage.setItem("useNotifications", String(useNotifications)); }, [useNotifications]);
  useEffect(() => { localStorage.setItem("quickConfig", JSON.stringify(quickConfig)); }, [quickConfig]);
  useEffect(() => { localStorage.setItem("queueConfig", JSON.stringify(queueConfig)); }, [queueConfig]);
  useEffect(() => { localStorage.setItem("theme", theme); }, [theme]);
  useEffect(() => { localStorage.setItem("language", language); }, [language]);
  useEffect(() => { localStorage.setItem("autoFetch", String(autoFetch)); }, [autoFetch]);

  // --- Initialization & Listeners ---

  useEffect(() => {
    // Request notification permission
    (async () => {
      let permission = await isPermissionGranted();
      if (!permission) {
        permission = await requestPermission() === 'granted';
      }
      setUseNotifications(permission);
    })();

    // Deep link listener using official plugin API
    const unlistenPromise = onOpenUrl((urls) => {
      console.log("Deep links received:", urls);
      if (urls && urls.length > 0) {
        const rawUrl = urls[0];
        const actualUrl = rawUrl.startsWith("modern-dl://") 
          ? rawUrl.replace("modern-dl://", "") 
          : rawUrl;
          
        if (actualUrl) {
          setQuickUrl(actualUrl);
          setActiveTab("quick");
          if (actualUrl.startsWith("http")) {
            fetchQuickMeta(actualUrl);
          }
        }
      }
    });

    return () => { 
      unlistenPromise.then(f => f());
    };
  }, [fetchQuickMeta]);

  // Download Progress Listener for Queue
  useEffect(() => {
    const listeners: Promise<UnlistenFn>[] = [];
    queue.forEach(item => {
      if (item.status === 'downloading') {
        listeners.push(listen<string>(`download-progress-${item.id}`, (event) => {
          const line = event.payload;
          if (line.includes("[download]") && line.includes("%")) {
            const match = line.match(/(\d+\.?\d*)%/);
            if (match) {
              setQueue(prev => prev.map(q => q.id === item.id ? { ...q, progress: `${match[1]}%` } : q));
            }
          }
        }));
      }
    });
    return () => { listeners.forEach(lp => lp.then(f => f())); };
  }, [queue.map(i => i.status === 'downloading').join(',')]);

  // --- Helpers ---

  const notifyCompletion = (title: string) => {
    if (useNotifications) {
      sendNotification({ title: "Download Finished", body: title });
    }
  };

  const handleBrowse = async () => {
    const selected = await open({ directory: true, multiple: false });
    if (selected && typeof selected === 'string') setSavePath(selected);
  };

  const startQuickDownload = async () => {
    if (!quickUrl || !savePath) return;
    setQuickStatus('downloading');
    setQuickProgress("0%");
    const id = "quick-dl";

    const unlisten = listen<string>(`download-progress-${id}`, (event) => {
      const line = event.payload;
      if (line.includes("[download]") && line.includes("%")) {
        const match = line.match(/(\d+\.?\d*)%/);
        if (match) setQuickProgress(`${match[1]}%`);
      }
    });

    try {
      await invoke("download_video", {
        url: quickUrl,
        savePath,
        quality: quickConfig.quality === "Highest" ? "4320" : quickConfig.quality,
        format: quickConfig.format,
        id,
        startTime: quickConfig.startTime || null,
        endTime: quickConfig.endTime || null,
        embedMetadata,
        codec: quickConfig.codec,
        audioCodec: quickConfig.audioCodec
      });
      setQuickStatus('finished');
      setQuickProgress("100%");
      notifyCompletion(quickMeta?.title || "Video download finished");
    } catch (e) {
      setQuickError(String(e));
      setQuickStatus('error');
    } finally {
      (await unlisten)();
    }
  };

  // Queue Resolving State
  const [isResolving, setIsResolving] = useState(false);

  const addToQueue = async () => {
    if (!queueUrl) return;
    setIsResolving(true);
    
    try {
      const infoList = await invoke<VideoMetadata[]>("get_video_info", { 
        url: queueUrl
      });
      
      const newItems: QueueItem[] = infoList.map(info => ({
        id: Math.random().toString(36).substring(2, 9),
        url: info.title, 
        metadata: info,
        status: 'pending', 
        progress: '0%',
        quality: queueConfig.quality === "Highest" ? "4320" : queueConfig.quality,
        format: queueConfig.format,
        codec: queueConfig.codec,
        audioCodec: queueConfig.audioCodec,
        startTime: "",
        endTime: ""
      }));

      setQueue(prev => [...prev, ...newItems]);
      setQueueUrl("");
    } catch (e) {
       const id = Math.random().toString(36).substring(2, 9);
       setQueue(prev => [...prev, {
        id,
        url: queueUrl,
        metadata: null,
        status: 'error',
        progress: '0%',
        quality: queueConfig.quality,
        format: queueConfig.format,
        codec: queueConfig.codec,
        audioCodec: queueConfig.audioCodec,
        startTime: "",
        endTime: "",
        error: String(e)
       }]);
    } finally {
      setIsResolving(false);
    }
  };

  const removeFromQueue = (id: string) => {
    setQueue(prev => prev.filter(q => q.id !== id));
  };

  const startBatch = async () => {
    if (isProcessing || !savePath) return;
    setIsProcessing(true);
    for (const item of queue) {
      if (item.status === 'pending' || item.status === 'error') {
        const currentId = item.id;
        setQueue(prev => prev.map(q => q.id === currentId ? { ...q, status: 'downloading', progress: '0%' } : q));
        try {
          await invoke("download_video", {
            url: item.url,
            savePath,
            quality: item.quality,
            format: item.format,
            id: item.id,
            startTime: null,
            endTime: null,
            embedMetadata,
            codec: item.codec,
            audioCodec: item.audioCodec
          });
          setQueue(prev => prev.map(q => q.id === currentId ? { ...q, status: 'finished', progress: '100%' } : q));
          notifyCompletion(item.metadata?.title || "Video in queue finished");
        } catch (e) {
          setQueue(prev => prev.map(q => q.id === currentId ? { ...q, status: 'error', error: String(e) } : q));
        }
      }
    }
    setIsProcessing(false);
  };

  return (
    <Layout>
      <Navbar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onSettingsClick={() => setIsSettingsOpen(true)}
        language={language}
      />
      
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
        autoFetch={autoFetch}
        setAutoFetch={setAutoFetch}
      />
      
      <main className="w-full px-6 flex-1">
        
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-200 dark:border-zinc-900 border-dashed">
            <div className="flex items-center gap-3 text-xs text-zinc-500">
                <button 
                    onClick={handleBrowse} 
                    className="hover:text-blue-600 dark:hover:text-blue-500 hover:underline flex items-center gap-1.5 transition-colors"
                >
                    <FolderIcon className="w-4 h-4" />
                    {savePath ? savePath : t.selectFolder}
                </button>
            </div>
            
            <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors select-none">
                    <input type="checkbox" checked={embedMetadata} onChange={e => setEmbedMetadata(e.target.checked)} className="rounded bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5" />
                    {t.embedMetadata}
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors select-none">
                    <input type="checkbox" checked={useNotifications} onChange={e => setUseNotifications(e.target.checked)} className="rounded bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-blue-600 focus:ring-0 focus:ring-offset-0 w-3.5 h-3.5" />
                    {t.notifications}
                </label>
            </div>
        </div>

        {activeTab === "quick" ? (
          <QuickDownloader
            url={quickUrl}
            setUrl={setQuickUrl}
            meta={quickMeta}
            status={quickStatus}
            progress={quickProgress}
            error={quickError}
            config={quickConfig}
            setConfig={setQuickConfig}
            onFetch={() => fetchQuickMeta()}
            onDownload={startQuickDownload}
            savePath={savePath}
            language={language}
          />
        ) : (
          <QueueManager 
            queue={queue}
            queueUrl={queueUrl}
            setQueueUrl={setQueueUrl}
            queueConfig={queueConfig}
            setQueueConfig={setQueueConfig}
            addToQueue={addToQueue}
            removeFromQueue={removeFromQueue}
            startBatch={startBatch}
            isProcessing={isProcessing}
            isResolving={isResolving}
            language={language}
          />
        )}
      </main>
      
      <footer className="text-center py-4 text-[10px] text-zinc-700 dark:text-zinc-600">
        v2.3
      </footer>
    </Layout>
  );
}

export default App;
