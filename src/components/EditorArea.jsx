import React from 'react';
import ReactMarkdown from 'react-markdown';
import { AlignLeft, CheckCircle2, Copy, Scissors, Star } from 'lucide-react';

const EditorArea = ({ script, setScript, optimizedScript, isLoading, metrics, activeMode, getRatingColor, onCopy }) => (
  <div className="flex-1 flex flex-col lg:flex-row p-4 lg:p-8 gap-6 main-bg-gradient overflow-y-auto custom-scrollbar">
    
    {/* CỘT NHẬP TRANSCRIPT */}
    <div className="w-full h-[400px] lg:h-full lg:flex-1 flex flex-col bg-[#01040a]/40 rounded-[2.5rem] border border-slate-800/50 p-6 lg:p-8 shadow-inner shrink-0 lg:shrink">
      <div className="flex items-center gap-2 text-slate-500 mb-6 border-b border-slate-800/20 pb-5">
        <AlignLeft size={18} /> 
        <span className="text-[11px] font-black uppercase tracking-widest italic">Input Raw Data</span>
      </div>
      <textarea 
        className="flex-1 bg-transparent border-none focus:ring-0 text-base lg:text-lg resize-none placeholder-slate-900 outline-none leading-relaxed custom-scrollbar" 
        placeholder={`Dán nội dung ${activeMode} của bạn tại đây...`} 
        value={script} 
        onChange={(e) => setScript(e.target.value)} 
        disabled={isLoading} 
      />
    </div>

    {/* CỘT KẾT QUẢ AI */}
    <div className={`w-full flex-1 min-h-[600px] lg:h-full lg:flex-[1.3] flex flex-col bg-slate-900/10 rounded-[2.5rem] border ${isLoading ? 'border-indigo-500/40' : 'border-slate-800/50'} p-6 lg:p-8 relative shadow-2xl shrink-0 lg:shrink`}>
      <div className="flex justify-between items-center mb-6 border-b border-slate-800/20 pb-5">
        <div className="flex items-center gap-2 text-indigo-400">
          <CheckCircle2 size={18} /> 
          <span className="text-[11px] font-black uppercase tracking-widest">AI Content Strategy</span>
        </div>
        <button onClick={onCopy} className="text-slate-600 hover:text-slate-400 p-2.5 hover:bg-slate-800 rounded-xl transition-all"><Copy size={18} /></button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {isLoading ? (
          <div className="space-y-8 pt-4 animate-pulse">
            <div className="h-5 bg-slate-800/50 w-1/2 rounded-full"></div>
            <div className="h-48 bg-slate-800/20 w-full rounded-[2rem]"></div>
          </div>
        ) : optimizedScript ? (
          <div className="prose prose-invert prose-indigo max-w-none prose-sm lg:prose-base pt-2"><ReactMarkdown>{optimizedScript}</ReactMarkdown></div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center opacity-20 py-10">
            <Scissors size={64} strokeWidth={1} />
            <p className="mt-5 text-sm font-bold uppercase tracking-widest">Waiting for input...</p>
          </div>
        )}
      </div>

      {/* FOOTER METRICS */}
      <div className="grid grid-cols-3 gap-3 mt-8 shrink-0">
        <div className="bg-[#020617]/80 p-4 rounded-2xl border border-slate-800/50 text-center">
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter mb-1">Accuracy</p>
          <p className="text-xl font-black text-white">{metrics.score}%</p>
        </div>
        <div className="bg-[#020617]/80 p-4 rounded-2xl border border-slate-800/50 text-center relative overflow-hidden">
          <Star size={40} className="absolute -right-2 -top-2 text-white/5" />
          <p className="text-[10px] text-slate-500 uppercase font-black tracking-tighter mb-1">Rank</p>
          <p className={`text-xl font-black transition-all ${getRatingColor(metrics.rating)}`}>{metrics.rating}</p>
        </div>
        <div className="bg-[#020617]/80 p-4 rounded-2xl border border-slate-800/50 flex items-center justify-center">
          <p className="text-[10px] font-black text-indigo-400 uppercase leading-tight text-center">{metrics.status}</p>
        </div>
      </div>
    </div>
  </div>
);
export default EditorArea;