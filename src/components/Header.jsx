import { Sparkles, Loader2, Menu, LogOut } from 'lucide-react';

const MODE_LABELS = {
  GENERAL: 'General',
  PODCAST: 'Podcast',
  NEWS: 'News & Trends',
  GUIDE: 'Hướng dẫn',
};

const Header = ({ isLoading, activeMode, onOptimize, onMenuClick, userEmail, onSignOut }) => (
  <header className="h-14 lg:h-16 border-b border-white/[0.06] flex items-center justify-between px-4 lg:px-8 bg-[#080d1a]/95 backdrop-blur-xl shrink-0 z-50">
    <div className="flex items-center gap-3">
      <button
        onClick={onMenuClick}
        aria-label="Open menu"
        className="p-2 lg:hidden text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
      >
        <Menu size={22} />
      </button>
      <div>
        <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest leading-none mb-0.5">HaSecTool AI</p>
        <h2 className="text-[15px] font-semibold text-white leading-none">{MODE_LABELS[activeMode] || activeMode}</h2>
      </div>
    </div>

    <div className="flex items-center gap-3">
      {userEmail && <span className="hidden md:block text-xs text-slate-600 truncate max-w-[220px]">{userEmail}</span>}
      {userEmail && onSignOut && (
        <button
          onClick={onSignOut}
          aria-label="Sign out"
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
        >
          <LogOut size={18} />
        </button>
      )}
      {activeMode !== 'GUIDE' && (
        <>
          <span className="hidden md:block text-xs text-slate-600">Ctrl+Enter</span>
          <button
            onClick={onOptimize}
            disabled={isLoading}
            aria-label="Start analysis"
            className="bg-indigo-600 hover:bg-indigo-500 px-4 lg:px-6 py-2.5 rounded-xl text-[13px] font-semibold flex items-center gap-2 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/20"
          >
            {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            <span className="hidden sm:inline">{isLoading ? 'Đang phân tích...' : 'Phân tích'}</span>
          </button>
        </>
      )}
    </div>
  </header>
);

export default Header;
