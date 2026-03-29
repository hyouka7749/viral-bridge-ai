import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

export default function Toast({ toasts, removeToast }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={removeToast} />
      ))}
    </div>
  );
}

function ToastItem({ toast, onRemove }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 3500);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  const isError = toast.type === 'error';

  return (
    <div
      className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl text-sm font-semibold animate-in slide-in-from-bottom-4 fade-in duration-300 max-w-sm
        ${isError
          ? 'bg-red-950/90 border-red-500/30 text-red-200'
          : 'bg-emerald-950/90 border-emerald-500/30 text-emerald-200'
        }`}
    >
      {isError ? <XCircle size={16} className="text-red-400 shrink-0" /> : <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />}
      <span className="flex-1">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="text-slate-500 hover:text-slate-300 transition-colors ml-1">
        <X size={14} />
      </button>
    </div>
  );
}
