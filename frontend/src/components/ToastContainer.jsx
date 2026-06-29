import React from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';

const ToastContainer = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        let bgColor = 'bg-white dark:bg-slate-800';
        let borderStyle = 'border-l-4 border-primary';
        let icon = <Info className="h-5 w-5 text-primary" />;

        if (toast.type === 'success') {
          borderStyle = 'border-l-4 border-secondary';
          icon = <CheckCircle2 className="h-5 w-5 text-secondary" />;
        } else if (toast.type === 'error') {
          borderStyle = 'border-l-4 border-red-500';
          icon = <XCircle className="h-5 w-5 text-red-500" />;
        } else if (toast.type === 'warning') {
          borderStyle = 'border-l-4 border-amber-500';
          icon = <AlertTriangle className="h-5 w-5 text-amber-500" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-4 rounded-r-lg shadow-xl ${bgColor} ${borderStyle} animate-toast-slide w-full`}
          >
            <div className="flex items-center gap-3">
              {icon}
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors ml-4"
            >
              <X className="h-4 w-4 text-slate-400 dark:text-slate-500" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
