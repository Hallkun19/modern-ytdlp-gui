
import { useState } from "react";
import { InformationCircleIcon, AdjustmentsHorizontalIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { VideoMetadata, QuickConfig, QUALITIES, FORMATS, CODECS, AUDIO_CODECS, isAudio } from "../types";
import { translations, Language } from "../locales";

interface QuickDownloaderProps {
  url: string;
  setUrl: (url: string) => void;
  meta: VideoMetadata | null;
  status: 'idle' | 'fetching' | 'downloading' | 'finished' | 'error';
  progress: string;
  error: string;
  config: QuickConfig;
  setConfig: (config: QuickConfig) => void;
  onFetch: () => void;
  onDownload: () => void;
  savePath: string;
  language: Language;
}

export function QuickDownloader({
  url, setUrl, meta, status, progress, error,
  config, setConfig, onFetch, onDownload, savePath, language
}: QuickDownloaderProps) {
  const t = translations[language];
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12">
      
      {/* URL Input Section */}
      <div className="space-y-2">
        <label className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{t.videoUrl}</label>
        <div className="relative">
            <input 
                type="text" 
                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={e => setUrl(e.target.value)}
                onBlur={onFetch}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {status === 'fetching' && <div className="w-4 h-4 border-2 border-zinc-400 dark:border-zinc-500 border-t-transparent rounded-full animate-spin"></div>}
            </div>
        </div>
      </div>

      {/* Main Content Area: Config + Preview */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* If metadata exists, show a clean preview card */}
        {meta && (
            <div className="flex gap-4 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl border border-zinc-100 dark:border-zinc-800">
                <div className="w-32 h-20 bg-zinc-200 dark:bg-zinc-950 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={meta.thumbnail} className="w-full h-full object-cover" alt="" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h3 className="text-sm font-medium text-zinc-900 dark:text-white truncate mb-1">{meta.title}</h3>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                        <span>{meta.uploader}</span>
                        <span>•</span>
                        <span>{meta.duration_string}</span>
                    </div>
                </div>
            </div>
        )}

        {/* Configuration */}
        <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
                <label className="text-xs text-zinc-500 font-medium">{t.format}</label>
                <div className="relative">
                    <select 
                        value={config.format} 
                        onChange={e => setConfig({...config, format: e.target.value})} 
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-300 focus:outline-none focus:border-blue-600 appearance-none"
                    >
                        {FORMATS.map(f => <option key={f} value={f}>{f.toUpperCase()}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 font-medium">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>
            <div className="space-y-1.5">
                <label className="text-xs text-zinc-500 font-medium">{t.quality}</label>
                <div className="relative">
                    <select 
                        disabled={isAudio(config.format)} 
                        value={config.quality} 
                        onChange={e => setConfig({...config, quality: e.target.value})} 
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-900 dark:text-zinc-300 focus:outline-none focus:border-blue-600 appearance-none disabled:opacity-50"
                    >
                        {QUALITIES.map(q => <option key={q} value={q}>{q === 'Highest' ? 'Highest' : q+'p'}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500 font-medium">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </div>
                </div>
            </div>
        </div>

        {/* Advanced Options Toggle */}
        <button 
            onClick={() => setShowAdvanced(!showAdvanced)} 
            className="flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors w-fit"
        >
            <AdjustmentsHorizontalIcon className="w-4 h-4" /> 
            {showAdvanced ? t.hideAdvanced : t.showAdvanced}
        </button>

        {showAdvanced && (
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
                        <InformationCircleIcon className="w-3.5 h-3.5" />
                        {t.timeRange}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input 
                            type="text" 
                            placeholder="Start (00:00:10)" 
                            value={config.startTime} 
                            onChange={e => setConfig({...config, startTime: e.target.value})} 
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-1.5 text-xs focus:border-blue-600 outline-none text-zinc-900 dark:text-zinc-300 font-mono" 
                        />
                        <input 
                            type="text" 
                            placeholder="End (00:01:00)" 
                            value={config.endTime} 
                            onChange={e => setConfig({...config, endTime: e.target.value})} 
                            className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md px-3 py-1.5 text-xs focus:border-blue-600 outline-none text-zinc-900 dark:text-zinc-300 font-mono" 
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-500">{t.videoCodec}</label>
                        <div className="grid grid-cols-2 gap-2">
                            {CODECS.map(c => (
                                <button 
                                    key={c.id} 
                                    onClick={() => setConfig({...config, codec: c.id})} 
                                    disabled={isAudio(config.format)}
                                    className={`px-2 py-1.5 text-[10px] font-medium rounded border transition-all truncate disabled:opacity-30 ${config.codec === c.id ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700'}`}
                                >
                                    {c.name.split(' ')[0]}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-medium text-zinc-500">{t.audioCodec}</label>
                        <div className="relative">
                            <select 
                                value={config.audioCodec} 
                                onChange={e => setConfig({...config, audioCodec: e.target.value})} 
                                className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-900 dark:text-zinc-300 focus:outline-none focus:border-blue-600 appearance-none"
                            >
                                {AUDIO_CODECS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}

        {/* Action Button */}
        <div>
            <button 
                onClick={onDownload}
                disabled={status === 'downloading' || status === 'fetching' || !url || !savePath}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-100 dark:disabled:bg-zinc-800 disabled:text-zinc-400 dark:disabled:text-zinc-600 text-white rounded-lg py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
                {status === 'downloading' ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span>{t.processing} {progress}</span>
                    </>
                ) : (
                    <>
                        <ArrowDownTrayIcon className="w-4 h-4" />
                        <span>{t.download}</span>
                    </>
                )}
            </button>
            {status === 'error' && (
                <p className="mt-2 text-xs text-red-500 dark:text-red-400 text-center">{error}</p>
            )}
        </div>
      </div>
    </div>
  );
}
