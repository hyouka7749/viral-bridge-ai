import { Zap, Layout, Mic2, Newspaper, X, BookOpen } from 'lucide-react';

const menuItems = [
  { id: 'GENERAL', label: 'General', sub: 'Viral clips từ bất kỳ video', icon: <Layout size={18} /> },
  { id: 'PODCAST', label: 'Podcast', sub: 'Golden nuggets từ podcast', icon: <Mic2 size={18} /> },
  { id: 'NEWS', label: 'News & Trends', sub: 'Breaking news highlights', icon: <Newspaper size={18} /> },
];

const bottomItems = [
  { id: 'GUIDE', label: 'Hướng dẫn', sub: 'Cách sử dụng HaSecTool', icon: <BookOpen size={18} /> },
];

function NavButton({ item, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-3 py-3.5 rounded-xl text-left transition-all duration-150 ${
        isActive
          ? 'bg-indigo-500/15 text-white border border-indigo-500/25'
          : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
      }`}
    >
      <span className={`shrink-0 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`}>{item.icon}</span>
      <div>
        <p className="text-[14px] font-semibold leading-none mb-1">{item.label}</p>
        <p className="text-[12px] text-slate-500 leading-tight">{item.sub}</p>
      </div>
    </button>
  );
}

const Sidebar = ({ activeMode, setActiveMode, isOpen, onClose }) => (
  <>
    {isOpen && (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60] lg:hidden" onClick={onClose} aria-hidden="true" />
    )}

    <aside
      className={`fixed inset-y-0 left-0 w-64 bg-[#080d1a] border-r border-white/[0.06] px-4 py-6 flex flex-col z-[70] transition-transform duration-300 lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      aria-label="Sidebar navigation"
    >
      {/* Logo */}
      <div className="flex items-center justify-between mb-8 px-1">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/30">
            <Zap size={20} fill="white" />
          </div>
          <div>
            <h1 className="text-[16px] font-bold text-white leading-none tracking-tight">HaSecTool</h1>
            <span className="text-[11px] text-indigo-400 font-medium tracking-wide">AI Studio</span>
          </div>
        </div>
        <button
          className="lg:hidden p-2 text-slate-400 hover:text-white transition-colors rounded-xl hover:bg-white/5"
          onClick={onClose}
          aria-label="Close menu"
        >
          <X size={20} />
        </button>
      </div>

      <p className="text-[11px] font-semibold text-slate-600 uppercase tracking-widest px-3 mb-2">Chế độ</p>

      <nav className="flex-1 space-y-1" aria-label="Editing modes">
        {menuItems.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={activeMode === item.id}
            onClick={() => { setActiveMode(item.id); onClose(); }}
          />
        ))}
      </nav>

      <div className="space-y-1 mt-4 pt-4 border-t border-white/[0.06]">
        {bottomItems.map((item) => (
          <NavButton
            key={item.id}
            item={item}
            isActive={activeMode === item.id}
            onClick={() => { setActiveMode(item.id); onClose(); }}
          />
        ))}
        <div className="px-3 pt-3 space-y-1.5">
          <p className="text-[12px] text-slate-600">HaSecTool v3.1 · DeepSeek Chat</p>
          <p className="text-[11px] text-slate-600 leading-relaxed">
            💸 Thiếu tiền nên dùng AI chậm — hãy donate cho Hà để có tiền nâng cấp AI xịn hơn :))
          </p>
        </div>
      </div>
    </aside>
  </>
);

export default Sidebar;
