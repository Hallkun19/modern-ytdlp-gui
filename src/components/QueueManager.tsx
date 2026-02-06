import { TrashIcon, CheckCircleIcon, QueueListIcon, PlayIcon } from "@heroicons/react/24/outline";
import { QueueItem, QueueConfig, QUALITIES, CODECS, AUDIO_CODECS, isAudio } from "../types";
import { translations, Language } from "../locales";

interface QueueManagerProps {
  queue: QueueItem[];
  queueUrl: string;
  setQueueUrl: (url: string) => void;
  queueConfig: QueueConfig;
  setQueueConfig: (config: QueueConfig) => void;
  addToQueue: () => void;
  removeFromQueue: (id: string) => void;
  startBatch: () => void;
  isProcessing: boolean;
  isResolving: boolean;
  language: Language;
}

export function QueueManager({
  queue, queueUrl, setQueueUrl, queueConfig, setQueueConfig,
  addToQueue, removeFromQueue, startBatch, isProcessing, isResolving, language
}: QueueManagerProps) {
  const t = translations[language];

  return (
    <div className="space-y-6 pb-12">
      
      {/* Input Section - Compact Bar */}
      <section className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-3 flex gap-3 items-center">
          <input 
              type="text" 
              className="flex-1 bg-transparent border-none outline-none text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 px-2"
              placeholder={t.videoUrl + "..."}
              value={queueUrl}
              onChange={e => setQueueUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addToQueue()}
          />
          <div className="h-6 w-px bg-zinc-100 dark:bg-zinc-800 mx-1"></div>
          
          <div className="relative flex items-center">
            <select 
                value={queueConfig.quality} 
                onChange={e => setQueueConfig({...queueConfig, quality: e.target.value})} 
                disabled={isAudio(queueConfig.format)}
                className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-[10px] text-zinc-700 dark:text-zinc-300 px-2 py-1 outline-none hover:border-zinc-300 dark:hover:border-zinc-600 focus:ring-1 focus:ring-blue-600 appearance-none cursor-pointer pr-6 disabled:opacity-30"
            >
                {QUALITIES.map(q => <option key={q} value={q}>{q === 'Highest' ? 'Highest' : q+'p'}</option>)}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          <div className="relative flex items-center">
            <select 
                value={queueConfig.codec} 
                onChange={e => setQueueConfig({...queueConfig, codec: e.target.value})} 
                disabled={isAudio(queueConfig.format)}
                className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-[10px] text-zinc-700 dark:text-zinc-300 px-2 py-1 outline-none hover:border-zinc-300 dark:hover:border-zinc-600 focus:ring-1 focus:ring-blue-600 appearance-none cursor-pointer pr-6 disabled:opacity-30"
            >
                {CODECS.map(c => <option key={c.id} value={c.id}>{c.name.split(' ')[0]}</option>)}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          <div className="relative flex items-center">
            <select 
                value={queueConfig.audioCodec} 
                onChange={e => setQueueConfig({...queueConfig, audioCodec: e.target.value})} 
                className="bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-[10px] text-zinc-700 dark:text-zinc-300 px-2 py-1 outline-none hover:border-zinc-300 dark:hover:border-zinc-600 focus:ring-1 focus:ring-blue-600 appearance-none cursor-pointer pr-6"
            >
                {AUDIO_CODECS.map(c => <option key={c.id} value={c.id}>{c.name.split(' ')[0]}</option>)}
            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          
          <button 
              onClick={addToQueue} 
              disabled={isResolving || !queueUrl}
              className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white px-4 py-1.5 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
             {isResolving ? (
                <>
                    <div className="w-3 h-3 border-2 border-zinc-400 dark:border-white/30 border-t-zinc-900 dark:border-t-white rounded-full animate-spin"></div>
                    <span>...</span>
                </>
             ) : (
                <span>Add</span>
             )}
          </button>
      </section>

      {/* Header & Actions */}
      <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wide">
              {t.queue} ({queue.length})
          </h2>
          {queue.some(i => i.status === 'pending') && (
              <button 
                onClick={startBatch} 
                disabled={isProcessing} 
                className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 text-xs font-medium flex items-center gap-2 disabled:opacity-50"
              >
                  <PlayIcon className="w-3.5 h-3.5" /> {t.startAll}
              </button>
          )}
      </div>

      {/* List Items - Clean Rows */}
      <div className="space-y-2">
          {queue.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-700 gap-2 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
                  <QueueListIcon className="w-8 h-8 opacity-40" />
                  <p className="text-xs font-medium">{t.noVideos}</p>
              </div>
          ) : (
              queue.map(item => (
                  <div key={item.id} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-3 flex gap-4 items-center">
                      
                      {/* Status Icon */}
                      <div className="flex-shrink-0">
                          {item.status === 'finished' ? (
                              <CheckCircleIcon className="w-5 h-5 text-green-500" />
                          ) : item.status === 'downloading' ? (
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                          ) : item.status === 'error' ? (
                              <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          ) : (
                              <div className="w-2 h-2 rounded-full bg-zinc-200 dark:bg-zinc-700"></div>
                          )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-200 truncate pr-4">
                                {item.metadata?.title || item.url}
                            </h3>
                            <button 
                                onClick={() => removeFromQueue(item.id)} 
                                className="text-zinc-400 dark:text-zinc-600 hover:text-red-500 transition-colors"
                            >
                                <TrashIcon className="w-4 h-4" />
                            </button>
                          </div>
                          
                          <div className="flex items-center gap-3 text-[10px] text-zinc-500">
                             <span>{item.quality === '4320' ? '8K' : item.quality+'p'} • {item.format.toUpperCase()}</span>
                             <span className="opacity-50">/</span>
                             <span>{item.codec.toUpperCase()} • {item.audioCodec.toUpperCase()}</span>
                             {item.status === 'downloading' && (
                                <span className="text-blue-600 dark:text-blue-500 font-mono">{item.progress}</span>
                             )}
                             {item.metadata?.uploader && (
                                <span className="opacity-70">by {item.metadata.uploader}</span>
                             )}
                          </div>
                          
                          {/* Slim Progress Bar */}
                          {item.status === 'downloading' && (
                              <div className="mt-2 h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden w-full">
                                  <div className="h-full bg-blue-600 transition-all duration-300" style={{width: item.progress}}></div>
                              </div>
                          )}
                          {item.status === 'error' && (
                              <div className="mt-1 text-red-500 text-[10px]">{item.error}</div>
                          )}
                      </div>
                  </div>
              ))
          )}
      </div>
    </div>
  );
}
