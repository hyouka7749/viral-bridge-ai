import { Sparkles, Loader2, Menu } from 'lucide-react';

const MODE_LABELS = {
  GENERAL: 'General',
  PODCAST: 'Podcast',
  NEWS: 'News & Trends',
  GUIDE: 'Hướng dẫn',
};

const Header = ({ isLoading, activeMode, onOptimize, onMenuClick }) => (
  <header className="h-16 border-b border-white/[0.06] flex items-center justify-between px-5 lg:px-8 bg-[#080d1a]/95 backdrop-blur-xl shrink-0 z-50">
    <div className="flex items-center gap-3">
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="p-2 lg:hidden text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
      >
        <Menu size={20} />
      </button>
      <div>
        <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest leading-none mb-0.5">HaSecTool AI</p>
        <h2 className="text-sm font-semibold text-white leading-none">{MODE_LABELS[activeMode] || activeMode}</h2>
      </div>
    </div>

    {activeMode !== 'GUIDE' && (
      <div className="flex items-center gap-3">
        <span className="hidden md:block text-[11px] text-slate-600 font-medium">Ctrl+Enter</span>
        <button
          onClick={onOptimize}
          disabled={isLoading}
          aria-label="Start analysis"
          className="bg-indigo-600 hover:bg-indigo-500 px-4 lg:px-6 py-2.5 rounded-xl text-[12px] font-semibold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
          <span className="hidden sm:inline">{isLoading ? 'Đang phân tích...' : 'Bắt đầu xử lý'}</span>
          <span className="sm:hidden">{isLoading ? '...' : 'Chạy'}</span>
        </button>
      </div>
    )}
  </header>
);

export default Header;
