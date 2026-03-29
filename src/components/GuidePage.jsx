import { BookOpen, Link2, FileText, Sparkles, Copy, Star, Zap, ChevronRight } from 'lucide-react';

const steps = [
  {
    icon: <Link2 size={20} />,
    title: 'Dán link YouTube',
    desc: 'Paste link video YouTube vào ô nhập ở góc trên bên trái. Transcript tiếng Anh sẽ được tự động tải về trong vài giây.',
    tip: 'Video cần có phụ đề (tự động hoặc thủ công). Hầu hết video tiếng Anh đều có.',
  },
  {
    icon: <FileText size={20} />,
    title: 'Kiểm tra transcript',
    desc: 'Transcript hiện ra kèm timestamp [MM:SS]. Bạn có thể chỉnh sửa thủ công nếu cần trước khi phân tích.',
    tip: 'Transcript càng đầy đủ, kết quả AI càng chính xác.',
  },
  {
    icon: <Sparkles size={20} />,
    title: 'Chọn chế độ & Phân tích',
    desc: 'Chọn chế độ phù hợp ở sidebar, sau đó nhấn "Phân tích phân đoạn hay" hoặc Ctrl+Enter.',
    tip: 'General cho video thông thường, Podcast cho talk show, News cho tin tức.',
  },
  {
    icon: <Copy size={20} />,
    title: 'Đọc kết quả & Copy',
    desc: 'AI trả về 3 phân đoạn tiềm năng nhất kèm thời gian cắt, hook text, chiến thuật viral và caption đăng tải.',
    tip: 'Nhấn Copy ở góc phải để copy toàn bộ kết quả.',
  },
];

const modes = [
  {
    id: 'GENERAL',
    label: 'General',
    color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    desc: 'Dành cho mọi loại video. AI tìm 3 đoạn có hook mạnh, standalone rõ ràng, dễ viral nhất.',
  },
  {
    id: 'PODCAST',
    label: 'Podcast',
    color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    desc: 'Tối ưu cho podcast và talk show. Tập trung vào "golden nuggets" — khoảnh khắc cảm xúc hoặc insight sâu.',
  },
  {
    id: 'NEWS',
    label: 'News & Trends',
    color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    desc: 'Dành cho video tin tức. AI tạo hook kiểu "STOP SCROLLING", tập trung vào facts và breaking news.',
  },
];

export default function GuidePage() {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-12 main-bg-gradient">
      <div className="max-w-3xl mx-auto space-y-12">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="bg-indigo-600/20 border border-indigo-500/30 p-3 rounded-2xl">
            <BookOpen size={22} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Hướng dẫn sử dụng</h1>
            <p className="text-[13px] text-slate-500 mt-0.5">HaSecTool AI — Tìm phân đoạn viral từ YouTube</p>
          </div>
        </div>

        {/* Steps */}
        <div>
          <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest mb-5">Các bước thực hiện</p>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-4 p-5 bg-slate-900/40 border border-slate-800/50 rounded-3xl">
                <div className="shrink-0 flex flex-col items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-indigo-600/15 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    {step.icon}
                  </div>
                  {i < steps.length - 1 && <div className="w-px flex-1 bg-slate-800/60 min-h-[16px]" />}
                </div>
                <div className="pb-2">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Bước {i + 1}</span>
                  </div>
                  <p className="text-sm font-bold text-white mb-1">{step.title}</p>
                  <p className="text-[13px] text-slate-400 leading-relaxed">{step.desc}</p>
                  <div className="mt-3 flex items-start gap-2 bg-amber-500/5 border border-amber-500/15 rounded-xl px-3 py-2">
                    <Zap size={12} className="text-amber-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-amber-300/70 leading-relaxed">{step.tip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modes */}
        <div>
          <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest mb-5">Các chế độ phân tích</p>
          <div className="space-y-3">
            {modes.map((m) => (
              <div key={m.id} className="flex items-start gap-4 p-5 bg-slate-900/40 border border-slate-800/50 rounded-3xl">
                <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl border shrink-0 ${m.color}`}>
                  {m.label}
                </span>
                <p className="text-[13px] text-slate-400 leading-relaxed pt-0.5">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Output explained */}
        <div>
          <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest mb-5">Kết quả AI trả về gồm gì?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: 'Thời gian cắt', desc: 'Điểm bắt đầu và kết thúc chính xác theo MM:SS' },
              { label: 'Hook 3 giây đầu', desc: 'Câu hook ALL-CAPS để giữ người xem không scroll' },
              { label: 'Chiến thuật viral', desc: 'Giải thích tâm lý tại sao đoạn này dễ viral' },
              { label: 'Caption & Hashtag', desc: 'Caption tiếng Anh sẵn sàng đăng TikTok/Reels' },
              { label: 'Rank S/A/B/C', desc: 'Đánh giá mức độ tiềm năng viral của toàn bộ video' },
              { label: 'Gợi ý dựng', desc: 'Hướng dẫn cắt dead air, chèn b-roll, zoom' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 p-4 bg-slate-900/30 border border-slate-800/40 rounded-2xl">
                <ChevronRight size={14} className="text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-white">{item.label}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Rating */}
        <div>
          <p className="text-[11px] font-semibold text-indigo-500 uppercase tracking-widest mb-5">Hệ thống Rank</p>
          <div className="flex gap-3 flex-wrap">
            {[
              { rank: 'S', color: 'text-amber-400 border-amber-500/30 bg-amber-500/5', desc: 'Viral tiềm năng cực cao' },
              { rank: 'A', color: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5', desc: 'Tốt, đáng đăng' },
              { rank: 'B', color: 'text-indigo-400 border-indigo-500/30 bg-indigo-500/5', desc: 'Trung bình, cần chỉnh' },
              { rank: 'C', color: 'text-slate-400 border-slate-600/30 bg-slate-800/20', desc: 'Yếu, khó viral' },
            ].map((r) => (
              <div key={r.rank} className={`flex items-center gap-3 px-4 py-3 rounded-2xl border ${r.color}`}>
                <span className="text-xl font-black">{r.rank}</span>
                <span className="text-[11px] text-slate-400">{r.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="h-8" />
      </div>
    </div>
  );
}
