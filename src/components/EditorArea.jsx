import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  AlignLeft, CheckCircle2, Copy, Check,
  Scissors, Star, Play, Loader2, Sparkles, Keyboard,
  Download,
  Plus,
} from 'lucide-react';

const EditorArea = ({
  script, setScript,
  youtubeUrl, setYoutubeUrl,
  segmentCount, setSegmentCount,
  optimizedScript,
  isLoading,
  metrics,
  getRatingColor, onCopy,
  onOptimize,
  onExportMarkdown,
  onExportJson,
  userEmail,
  analyses,
  onLoadAnalysis,
  projects,
  activeProjectId,
  onSetActiveProjectId,
  onCreateProject,
}) => {
  const [copied, setCopied] = useState(false);
  const [tab, setTab] = useState('input'); // mobile tab: 'input' | 'result'
  const [isProjectFormOpen, setIsProjectFormOpen] = useState(false);
  const [isProjectCreating, setIsProjectCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const wordCount = script.trim() ? script.trim().split(/\s+/).length : 0;

  const handleCopy = () => {
    onCopy();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputPanel = (
    <div className="flex flex-col gap-3 h-full">
      {Array.isArray(projects) && projects.length > 0 && (
        <div className="bg-white/[0.04] border border-white/[0.09] rounded-2xl flex items-center gap-3 px-4 py-3.5 focus-within:border-indigo-500/50 transition-colors">
          <div className="flex-1">
            <p className="text-[12px] text-slate-500 font-semibold leading-none mb-1">Project</p>
            <p className="text-[11px] text-slate-700 leading-none">Lưu theo workspace</p>
          </div>
          <select
            value={activeProjectId || ''}
            onChange={(e) => onSetActiveProjectId?.(e.target.value)}
            className="bg-white/[0.03] border border-white/[0.10] rounded-xl px-3 py-2 text-[13px] text-slate-200 outline-none focus:border-indigo-500/50 max-w-[260px]"
            disabled={isLoading}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id} className="bg-[#0b1020]">
                {p.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setIsProjectFormOpen((v) => !v)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            disabled={isLoading}
            aria-label="Create project"
          >
            <Plus size={18} />
          </button>
        </div>
      )}

      {isProjectFormOpen && (
        <div className="bg-white/[0.03] border border-white/[0.08] rounded-2xl px-4 py-3 flex items-center gap-3">
          <input
            type="text"
            className="flex-1 bg-transparent border border-white/[0.10] rounded-xl px-3 py-2 text-[13px] text-slate-200 outline-none focus:border-indigo-500/50"
            placeholder="Tên project..."
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            disabled={isLoading || isProjectCreating}
          />
          <button
            type="button"
            onClick={async () => {
              const name = newProjectName.trim();
              if (!name) return;
              setIsProjectCreating(true);
              try {
                await onCreateProject?.(name);
                setNewProjectName('');
                setIsProjectCreating(false);
                setIsProjectFormOpen(false);
              } catch {
                setIsProjectCreating(false);
              }
            }}
            className="px-4 py-2 rounded-xl text-[13px] font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors disabled:bg-white/5 disabled:text-slate-600 disabled:cursor-not-allowed"
            disabled={isLoading || !newProjectName.trim() || isProjectCreating}
          >
            Tạo
          </button>
        </div>
      )}

      {/* YouTube URL */}
      <div className="bg-white/[0.04] border border-white/[0.09] rounded-2xl flex items-center gap-3 px-4 py-3.5 focus-within:border-indigo-500/50 transition-colors">
        <Play size={17} fill="currentColor" className="text-red-500 shrink-0" />
        <input
          type="url"
          inputMode="url"
          className="flex-1 bg-transparent border-none focus:ring-0 text-[15px] outline-none text-slate-200 placeholder-slate-600 font-medium"
          placeholder="Dán link YouTube..."
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onOptimize()}
        />
      </div>

      <div className="bg-white/[0.04] border border-white/[0.09] rounded-2xl flex items-center gap-3 px-4 py-3.5 focus-within:border-indigo-500/50 transition-colors">
        <Scissors size={16} className="text-indigo-400 shrink-0" />
        <div className="flex-1">
          <p className="text-[12px] text-slate-500 font-semibold leading-none mb-1">Số phân đoạn xuất ra</p>
          <p className="text-[11px] text-slate-700 leading-none">Tối đa 10</p>
        </div>
        <input
          type="number"
          min={1}
          max={10}
          step={1}
          className="w-20 bg-transparent border border-white/[0.10] rounded-xl px-3 py-2 text-[14px] text-slate-200 outline-none focus:border-indigo-500/50"
          value={segmentCount}
          onChange={(e) => {
            const n = Number.parseInt(e.target.value, 10);
            if (!Number.isFinite(n)) return;
            setSegmentCount(Math.min(10, Math.max(1, n)));
          }}
          disabled={isLoading}
        />
      </div>

      {/* Transcript */}
      <div className="flex-1 flex flex-col bg-white/[0.02] rounded-2xl border border-white/[0.07] overflow-hidden min-h-[180px]">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
          <div className="flex items-center gap-2 text-slate-400">
            <AlignLeft size={14} />
            <span className="text-xs font-semibold uppercase tracking-widest">Transcript</span>
          </div>
          <div className="flex items-center gap-3">
            {wordCount > 0 && (
              <span className="text-xs text-slate-600">{wordCount.toLocaleString()} words</span>
            )}
            <div className="hidden sm:flex items-center gap-1 text-slate-700 text-xs">
              <Keyboard size={11} />
              <span>Ctrl+Enter</span>
            </div>
          </div>
        </div>
        <textarea
          className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] resize-none placeholder-slate-800 outline-none leading-relaxed custom-scrollbar font-mono p-4 text-slate-300"
          placeholder="Tuỳ chọn: dán transcript thủ công, hoặc để trống và dùng link YouTube ở trên..."
          value={script}
          onChange={(e) => setScript(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {/* Analyze button */}
      <button
        onClick={onOptimize}
        disabled={isLoading || (!youtubeUrl && !script.trim())}
        className="w-full py-4 rounded-2xl font-semibold text-[15px] flex items-center justify-center gap-2.5 transition-all
          bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-[0.98]
          disabled:bg-white/5 disabled:text-slate-600 disabled:shadow-none disabled:cursor-not-allowed"
      >
        {isLoading ? <Loader2 size={17} className="animate-spin" /> : <Sparkles size={17} />}
        {isLoading ? 'Đang phân tích...' : 'Phân tích phân đoạn hay'}
      </button>
    </div>
  );

  const resultPanel = (
    <div className={`flex flex-col h-full bg-white/[0.02] rounded-2xl border overflow-hidden
      ${isLoading ? 'border-indigo-500/30' : 'border-white/[0.07]'} transition-colors duration-500`}>
      {/* Header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2 text-indigo-400">
          <CheckCircle2 size={15} />
          <span className="text-xs font-semibold uppercase tracking-widest">AI Content Strategy</span>
        </div>
        <div className="flex items-center gap-2">
          {userEmail && Array.isArray(analyses) && analyses.length > 0 && (
            <select
              value=""
              onChange={(e) => {
                const id = e.target.value;
                if (!id) return;
                onLoadAnalysis?.(id);
                e.target.value = '';
              }}
              className="hidden md:block bg-white/[0.03] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-slate-300 outline-none focus:border-indigo-500/50 max-w-[240px]"
            >
              <option value="" className="bg-[#0b1020]">Lịch sử</option>
              {analyses.map((a) => (
                <option key={a.id} value={a.id} className="bg-[#0b1020]">
                  {new Date(a.created_at).toLocaleString()} · {a.mode}
                </option>
              ))}
            </select>
          )}
          {optimizedScript && (
          <div className="flex items-center gap-2">
            <button
              onClick={onExportJson}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-slate-500 hover:text-slate-300 hover:bg-white/5"
            >
              <Download size={13} />
              JSON
            </button>
            <button
              onClick={onExportMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all text-slate-500 hover:text-slate-300 hover:bg-white/5"
            >
              <Download size={13} />
              MD
            </button>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all
                ${copied ? 'text-emerald-400 bg-emerald-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-5">
        {isLoading ? (
          <LoadingSkeleton />
        ) : optimizedScript ? (
          <div className="prose prose-invert prose-indigo max-w-none pt-1">
            <ReactMarkdown>{optimizedScript}</ReactMarkdown>
          </div>
        ) : (
          <EmptyState />
        )}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-2 p-3 border-t border-white/[0.06] shrink-0">
        <MetricCard label="Accuracy" value={metrics.score !== '--' ? `${metrics.score}%` : '--'} />
        <MetricCard
          label="Rank"
          value={metrics.rating}
          valueClass={`text-lg font-bold ${getRatingColor(metrics.rating)}`}
          icon={<Star size={26} className="absolute -right-1 -top-1 text-white/[0.04]" />}
        />
        <div className="bg-white/[0.03] p-3 rounded-xl border border-white/[0.06] flex items-center justify-center">
          <p className="text-[10px] font-semibold text-indigo-400 uppercase leading-tight tracking-wide text-center">{metrics.status}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col main-bg-gradient overflow-hidden">

      {/* ── MOBILE: tab switcher ── */}
      <div className="lg:hidden flex border-b border-white/[0.06] shrink-0">
        {[
          { id: 'input', label: 'Nhập liệu' },
          { id: 'result', label: isLoading ? 'Đang phân tích...' : optimizedScript ? 'Kết quả ✦' : 'Kết quả' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 py-3.5 text-[14px] font-semibold transition-colors relative
              ${tab === t.id ? 'text-white' : 'text-slate-500'}`}
          >
            {t.label}
            {tab === t.id && (
              <span className="absolute bottom-0 left-1/4 right-1/4 h-0.5 bg-indigo-500 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* ── MOBILE: single panel ── */}
      <div className="lg:hidden flex-1 overflow-y-auto custom-scrollbar p-4">
        {tab === 'input' ? inputPanel : resultPanel}
      </div>

      {/* ── DESKTOP: two columns ── */}
      <div className="hidden lg:flex flex-1 p-6 gap-5 overflow-hidden">
        <div className="flex-1 flex flex-col">{inputPanel}</div>
        <div className="flex-[1.3] flex flex-col">{resultPanel}</div>
      </div>
    </div>
  );
};

function MetricCard({ label, value, valueClass, icon }) {
  return (
    <div className="bg-white/[0.03] p-3 rounded-xl border border-white/[0.06] text-center relative overflow-hidden">
      {icon}
      <p className="text-[10px] text-slate-600 uppercase font-semibold tracking-widest mb-1">{label}</p>
      <p className={valueClass || 'text-base font-bold text-white'}>{value}</p>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-3 pt-2">
      {[55, 90, 75, 0, 45, 100, 70, 0, 60, 85].map((w, i) =>
        w === 0
          ? <div key={i} className="h-3" />
          : <div key={i} className="h-2.5 bg-white/[0.05] rounded-full animate-pulse" style={{ width: `${w}%` }} />
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="h-full min-h-[200px] flex flex-col items-center justify-center gap-3 select-none">
      <Scissors size={36} strokeWidth={1.5} className="text-slate-700" />
      <div className="text-center">
        <p className="text-[15px] font-semibold text-slate-600">Chờ phân tích</p>
        <p className="text-[13px] mt-1 text-slate-700">Dán link YouTube rồi nhấn nút bên dưới</p>
      </div>
    </div>
  );
}

export default EditorArea;
