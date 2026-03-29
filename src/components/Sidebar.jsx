import React from 'react';
import { Zap, Layout, Mic2, Newspaper, X } from 'lucide-react';

const Sidebar = ({ activeMode, setActiveMode, isOpen, onClose }) => {
  const menuItems = [
    { id: 'GENERAL', label: 'Bảng điều khiển', icon: <Layout size={18} /> },
    { id: 'PODCAST', label: 'Edit Podcast', icon: <Mic2 size={18} /> },
    { id: 'NEWS', label: 'Edit News', icon: <Newspaper size={18} /> },
  ];

  return (
    <>
      {/* Lớp phủ Overlay khi menu mở trên Mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[60] lg:hidden" onClick={onClose} />
      )}
      
      <aside className={`fixed inset-y-0 left-0 w-72 bg-[#01040a] border-r border-slate-800/50 p-6 flex flex-col z-[70] transition-transform duration-300 lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-10 px-2">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-500/20"><Zap size={24} fill="white" /></div>
            <h1 className="text-2xl font-black tracking-tighter text-white">ViralBridge</h1>
          </div>
          <button className="lg:hidden p-2 text-slate-500 hover:text-white" onClick={onClose}><X size={24}/></button>
        </div>

        <nav className="flex-1 space-y-3">
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => {setActiveMode(item.id); onClose();}} className={`flex items-center gap-3 w-full p-4 rounded-2xl text-sm font-bold transition-all ${activeMode === item.id ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20' : 'text-slate-500 hover:bg-slate-900/50 hover:text-slate-300'}`}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <div className="mt-auto p-5 bg-slate-900/50 rounded-[2rem] border border-slate-800/50">
          <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mb-1">Demo Project</p>
          <p className="text-[11px] text-slate-500 font-medium">Responsive v3.0 - Ready</p>
        </div>
      </aside>
    </>
  );
};
export default Sidebar;