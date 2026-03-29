import React from 'react';
import { Zap, Layout, Mic2, Newspaper } from 'lucide-react';

const Sidebar = ({ activeMode, setActiveMode }) => {
  const menuItems = [
    { id: 'GENERAL', label: 'Edit Popular', icon: <Layout size={18} /> },
    { id: 'PODCAST', label: 'Edit Podcast', icon: <Mic2 size={18} /> },
    { id: 'NEWS', label: 'Edit News', icon: <Newspaper size={18} /> },
  ];

  return (
    <aside className="w-64 border-r border-slate-800/50 p-6 flex flex-col bg-[#01040a] z-30">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
          <Zap size={22} fill="white" />
        </div>
        <h1 className="text-xl font-bold">ViralBridge <span className="text-indigo-500">AI</span></h1>
      </div>
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveMode(item.id)}
            className={`flex items-center gap-3 w-full p-3 rounded-xl text-sm font-medium transition-all ${
              activeMode === item.id 
              ? 'bg-slate-900 border border-slate-800 text-indigo-400' 
              : 'text-slate-500 hover:bg-slate-900/50 hover:text-slate-300'
            }`}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </nav>
      <div className="mt-auto p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl">
        <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest mb-1">Dự án Đồ Án</p>
        <p className="text-[11px] text-slate-500 font-medium">Chế độ: {activeMode}</p>
      </div>
    </aside>
  );
};

export default Sidebar;