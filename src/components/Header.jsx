import React from 'react';
import { Sparkles, Loader2, Menu } from 'lucide-react';

const Header = ({ isLoading, activeMode, onOptimize, onMenuClick }) => (
  <header className="h-20 border-b border-slate-800/50 flex items-center justify-between px-4 lg:px-10 bg-[#020617]/90 backdrop-blur-2xl shrink-0 z-50">
    <div className="flex items-center gap-4">
      <button onClick={onMenuClick} className="p-2 lg:hidden text-slate-400 hover:bg-slate-800 rounded-xl transition-colors">
        <Menu size={24} />
      </button>
      <div className="flex flex-col">
        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">Hệ thống AI</span>
        <h2 className="text-sm font-bold text-white uppercase tracking-tight">{activeMode} Mode</h2>
      </div>
    </div>

    <button onClick={onOptimize} disabled={isLoading} className="bg-indigo-600 hover:bg-indigo-500 px-5 lg:px-8 py-3 rounded-2xl text-xs font-black flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-indigo-500/10">
      {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
      <span className="hidden sm:inline">{isLoading ? 'Đang phân tích...' : 'Bắt đầu xử lý'}</span>
      <span className="sm:hidden">{isLoading ? '...' : 'Chạy'}</span>
    </button>
  </header>
);
export default Header;