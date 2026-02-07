
import { useEffect, useState } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  InformationCircleIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  id: string;
  message: string;
  type: ToastType;
  onClose: (id: string) => void;
  duration?: number;
}

export function Toast({ id, message, type, onClose, duration = 5000 }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => onClose(id), 300); // Wait for exit animation
  };

  const icons = {
    success: <CheckCircleIcon className="w-5 h-5 text-emerald-500" />,
    error: <XCircleIcon className="w-5 h-5 text-rose-500" />,
    info: <InformationCircleIcon className="w-5 h-5 text-blue-500" />
  };

  const bgColors = {
    success: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/50',
    error: 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800/50',
    info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/50'
  };

  return (
    <div 
      className={`
        flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md
        transition-all duration-300 ease-out
        ${bgColors[type]}
        ${isExiting ? 'opacity-0 translate-x-8 scale-95' : 'opacity-100 translate-x-0 scale-100'}
      `}
    >
      <div className="flex-shrink-0">
        {icons[type]}
      </div>
      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2">
        {message}
      </p>
      <button 
        onClick={handleClose}
        className="ml-auto p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 text-zinc-400 dark:text-zinc-500 transition-colors"
      >
        <XMarkIcon className="w-4 h-4" />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: { id: string; message: string; type: ToastType }[];
  removeToast: (id: string) => void;
}

export function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast 
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={removeToast}
          />
        </div>
      ))}
    </div>
  );
}
