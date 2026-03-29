import React from 'react';
import ReactMarkdown from 'react-markdown';
import { AlignLeft, CheckCircle2, Copy, Scissors, Star } from 'lucide-react';

const EditorArea = ({ script, setScript, optimizedScript, isLoading, metrics, activeMode, getRatingColor, onCopy }) => (
  <div className="flex-1 flex p-6 gap-6 main-bg-gradient overflow-hidden">
    <div className="flex-1 flex flex-col bg-slate-900/20 rounded-[2rem] border border-slate-800/50 p-6 overflow-hidden shadow-inner">
      <div className="flex items-center gap-2 text-slate-500 mb-4 border-b border-slate-800/20 pb-4">
        <AlignLeft size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Dữ liệu đầu vào</span>
      </div>
      <textarea className="flex-1 bg-transparent border-none focus:ring-0 text-base resize-none placeholder-slate-800 outline-none custom-scrollbar leading-relaxed" 
        placeholder={`Dán nội dung ${activeMode.toLowerCase()} vào đây...`} value={script} onChange={(e) => setScript(e.target.value)} disabled={isLoading} />
    </div>

    <div className={`flex-[1.2] flex flex-col bg-slate-900/10 rounded-[2rem] border ${isLoading ? 'border-indigo-500/40' : 'border-slate-800/50'} p-6 relative overflow-hidden transition-all shadow-2xl`}>
      <div className="flex justify-between items-center mb-4 border-b border-slate-800/20 pb-4">
        <div className="flex items-center gap-2 text-indigo-400">
          <CheckCircle2 size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Kế hoạch AI</span>
        </div>
        <button onClick={onCopy} className="text-slate-600 hover:text-slate-400 p-2 hover:bg-slate-800 rounded-lg"><Copy size={16} /></button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {isLoading ? (
          <div className="space-y-6 pt-4 animate-pulse">
            <div className="h-4 bg-slate-800/50 w-1/2 rounded-full"></div>
            <div className="h-32 bg-slate-800/20 w-full rounded-3xl"></div>
          </div>
        ) : optimizedScript ? (
          <div className="prose prose-invert prose-indigo max-w-none prose-sm pt-2"><ReactMarkdown>{optimizedScript}</ReactMarkdown></div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20"><Scissors size={48} /><p className="mt-4 text-sm font-medium">Đang đợi lệnh {activeMode}...</p></div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3 mt-6">
        <div className="bg-[#020617]/80 p-3 rounded-xl border border-slate-800/50"><p className="text-[9px] text-slate-500 uppercase font-black">Chính xác</p><p className="text-xl font-black">{metrics.score}%</p></div>
        <div className="bg-[#020617]/80 p-3 rounded-xl border border-slate-800/50 relative overflow-hidden">
          <Star size={32} className="absolute -right-1 -top-1 text-white/5" />
          <p className="text-[9px] text-slate-500 uppercase font-black">Xếp hạng</p>
          <p className={`text-xl font-black ${getRatingColor(metrics.rating)}`}>{metrics.rating}</p>
        </div>
        <div className="bg-[#020617]/80 p-3 rounded-xl border border-slate-800/50"><p className="text-[9px] text-slate-500 uppercase font-black">Trạng thái</p><p className="text-[10px] font-bold text-indigo-400 mt-1 truncate uppercase">{metrics.status}</p></div>
      </div>
    </div>
  </div>
);

export default EditorArea;