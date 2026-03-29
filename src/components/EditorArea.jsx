import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  AlignLeft,
  CheckCircle2,
  Copy,
  Check,
  Scissors,
  Star,
  Play,
  Loader2,
  Sparkles,
  Keyboard,
} from 'lucide-react';

const EditorArea = ({
  script, setScript,
  youtubeUrl, setYoutubeUrl,
  optimizedScript,
  isLoading,
  isFetchingTranscript,
  metrics,
  getRatingColor, onCopy,
  onOptimize,
}) => {
  const [copied, setCopied] = useState(false);
  const wordCount = script.trim() ? script.trim().split(/\s+/).length : 0;

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col lg:flex-row p-4 lg:p-6 gap-4 main-bg-gradient overflow-y-auto lg:overflow-hidden custom-scrollbar">

      {/* LEFT: INPUT */}
      <div className="w-full lg:flex-1 flex flex-col gap-3 shrink-0 lg:shrink">

        {/* YouTube URL */}
        <div className={`bg-white/[0.03] border rounded-2xl flex items-center gap-3 px-4 py-3 transition-all duration-200
          ${isFetchingTranscript ? 'border-indigo-500/50 shadow-sm shadow-indigo-500/10' : 'border-white/[0.08] focus-within:border-indigo-500/40'}`}>
          <div className={`shrink-0 transition-colors ${isFetchingTranscript ? 'text-indigo-400' : 'text-red-500'}`}>
            {isFetchingTranscript
              ? <Loader2 size={18} className="animate-spin" />
              : <Play size={18} fill="currentColor" />}
          </div>
          <input
            type="text"
            className="flex-1 bg-transparent border-none focus:ring-0 text-[13px] outline-none text-slate-200 placeholder-slate-600 font-medium"
            placeholder="Dán link YouTube — transcript tự động tải..."
            value={youtubeUrl}
            onChange={(e) => setYoutubeUrl(e.target.value)}
          />
          {isFetchingTranscript && (
            <span className="text-[11px] text-indigo-400 font-semibold shrink-0">Đang lấy...</span>
          )}
        </div>

        {/* Transcript */}
        <div className="flex-1 flex flex-col bg-white/[0.02] rounded-2xl border border-white/[0.07] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 text-slate-400">
              <AlignLeft size={15} />
              <span className="text-[11px] font-semibold uppercase tracking-widest">Transcript</span>
            </div>
            <div className="flex items-center gap-3">
              {wordCount > 0 && (
                <span className="text-[11px] text-slate-600 font-medium">{wordCount.toLocaleString()} words</span>
              )}
              {script && (
                <div className="flex items-center gap-1 text-slate-700 text-[11px]">
                  <Keyboard size={11} />
                  <span>Ctrl+Enter</span>
                </div>
              )}
            </div>
          </div>

          {isFetchingTranscript ? (
            <div className="flex-1 p-5 flex flex-col gap-2.5">
              {[75, 100, 85, 90, 70, 95].map((w, i) => (
                <div key={i} className="h-2.5 bg-white/5 rounded-full animate-pulse" style={{ width: `${w}%` }} />
              ))}
            </div>
          ) : (
            <textarea
              className="flex-1 bg-transparent border-none focus:ring-0 text-[13px] resize-none placeholder-slate-800 outline-none leading-relaxed custom-scrollbar font-mono p-5 text-slate-300"
              placeholder="Transcript sẽ hiện ở đây sau khi dán link YouTube..."
              value={script}
              onChange={(e) => setScript(e.target.value)}
              disabled={isLoading}
            />
          )}
        </div>

        {/* Analyze button */}
        <button
          onClick={onOptimize}
          disabled={isLoading || isFetchingTranscript || !script.trim()}
          className="w-full py-3.5 rounded-xl font-semibold text-[13px] flex items-center justify-center gap-2 transition-all
            bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-[0.98]
            disabled:bg-white/5 disabled:text-slate-600 disabled:shadow-none disabled:cursor-not-allowed"
        >
          {isLoading ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
          {isLoading ? 'Đang phân tích...' : 'Phân tích phân đoạn hay'}
        </button>
      </div>

      {/* RIGHT: AI RESULTS */}
      <div className={`w-full flex-1 min-h-[600px] lg:h-full lg:flex-[1.3] flex flex-col bg-white/[0.02] rounded-2xl border
        ${isLoading ? 'border-indigo-500/30' : 'border-white/[0.07]'}
        overflow-hidden shrink-0 lg:shrink transition-colors duration-500`}>

        {/* Result header */}
        <div className="flex justify-between items-center px-5 py-3.5 border-b border-white/[0.06] shrink-0">
          <div className="flex items-center gap-2 text-indigo-400">
            <CheckCircle2 size={15} />
            <span className="text-[11px] font-semibold uppercase tracking-widest">AI Content Strategy</span>
          </div>
          {optimizedScript && (
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all
                ${copied ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
          {isLoading ? (
            <LoadingSkeleton />
          ) : optimizedScript ? (
            <div className="prose prose-invert prose-indigo max-w-none prose-sm pt-1">
              <ReactMarkdown>{optimizedScript}</ReactMarkdown>
            </div>
          ) : (
            <EmptyState hasTranscript={!!script} />
          )}
        </div>

        {/* Metrics footer */}
        <div className="grid grid-cols-3 gap-2 p-4 border-t border-white/[0.06] shrink-0">
          <MetricCard label="Accuracy" value={metrics.score !== '--' ? `${metrics.score}%` : '--'} />
          <MetricCard
            label="Rank"
            value={metrics.rating}
            valueClass={`text-lg font-bold transition-all ${getRatingColor(metrics.rating)}`}
            icon={<Star size={28} className="absolute -right-1 -top-1 text-white/[0.04]" />}
          />
          <div className="bg-white/[0.03] p-3 rounded-xl border border-white/[0.06] flex items-center justify-center">
            <p className="text-[10px] font-semibold text-indigo-400 uppercase leading-tight tracking-wide text-center">{metrics.status}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

function MetricCard({ label, value, valueClass, icon }) {
  return (
    <div className="bg-white/[0.03] p-3 rounded-xl border border-white/[0.06] text-center relative overflow-hidden">
      {icon}
      <p className="text-[9px] text-slate-600 uppercase font-semibold tracking-widest mb-1">{label}</p>
      <p className={valueClass || 'text-lg font-bold text-white'}>{value}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 pt-2">
      {[60, 100, 85, 0, 50, 100, 80, 0, 65, 90].map((w, i) =>
        w === 0
          ? <div key={i} className="h-4" />
          : <div key={i} className={`h-2.5 bg-white/5 rounded-full animate-pulse`} style={{ width: `${w}%` }} />
      )}
    </div>
  );
}

function EmptyState({ hasTranscript }) {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-3 py-10 select-none">
      <Scissors size={40} strokeWidth={1.5} className="text-slate-700" />
      <div className="text-center">
        <p className="text-[13px] font-semibold text-slate-600">
          {hasTranscript ? 'Sẵn sàng phân tích' : 'Chờ transcript...'}
        </p>
        <p className="text-[11px] mt-1 text-slate-700">
          {hasTranscript ? 'Nhấn nút bên dưới để bắt đầu' : 'Dán link YouTube để bắt đầu'}
        </p>
      </div>
    </div>
  );
}

export default EditorArea;
