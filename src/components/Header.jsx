import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

const Header = ({ isLoading, activeMode, onOptimize }) => (
  <header className="h-16 border-b border-slate-800/50 flex items-center justify-between px-8 bg-[#020617]/50 backdrop-blur-xl shrink-0 z-20">
    <div className="flex items-center gap-3">
      <div className={`h-2 w-2 rounded-full ${isLoading ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]'}`}></div>
      <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Hệ thống: {activeMode}</h2>
    </div>
    <button onClick={onOptimize} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2 rounded-full text-xs font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50 shadow-indigo-500/10">
      {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
      {isLoading ? 'Đang phân tích...' : 'Bắt đầu xử lý'}
    </button>
  </header>
);

export default Header;