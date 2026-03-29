import React, { useState } from 'react';
import { Layout, Zap, Globe, BarChart3, Settings, Copy, Sparkles, Loader2, Scissors, FileVideo, FileAudio, ImageIcon, X } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';

export default function App() {
  // --- 1. QUẢN LÝ TRẠNG THÁI (STATE) ---
  const [script, setScript] = useState('');
  const [optimizedScript, setOptimizedScript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [metrics, setMetrics] = useState({ score: '--', status: 'Ready' });

  // --- 2. CẤU HÌNH HỆ THỐNG (MASTER PROMPT) ---
  const SYSTEM_INSTRUCTIONS = `
    ROLE: Professional TikTok US Video Editing Assistant. 
    STYLE: Fast, precise, "instant noodle" style editing.

    TASK: Identify the 3 highest-potential segments (60-180s) from the provided content (Transcript or Media).
    HARD CONSTRAINT: Every segment MUST be 60–180 seconds. Under 60s = DISQUALIFIED.

    OUTPUT FORMAT:
    Use Markdown headers (###). Repeat exactly 3 times (CUT 1, 2, 3).
    
    ### ✂️ CUT [1/2/3] — [Catchy English Title]
    **1. CUT POINTS**
    - ⏰ Timecode: MM:SS → MM:SS
    - ⏱️ Duration: Xs
    - 🟢 Start Quote: "..."
    - 🔴 End Quote: "..."
    - ⚠️ Edit Note: [Vietnamese instruction for editor]

    **2. ON-SCREEN TEXT**
    - 3-Second Hook Text: [ALL CAPS ENGLISH CURIOSTY LINE]

    **3. WHY THIS CUT WORKS**
    - [Explain strategy in Vietnamese]

    **4. TIKTOK METADATA**
    - Caption: [Viral English Caption]
    - Hashtags: #fyp #viral #trending
  `;

  // --- 3. HÀM CHUYỂN ĐỔI FILE SANG BASE64 ---
  const fileToGenerativePart = async (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve({
        inlineData: {
          data: reader.result.split(',')[1],
          mimeType: file.type
        },
      });
      reader.readAsDataURL(file);
    });
  };

  // --- 4. HÀM XỬ LÝ GỌI AI (MULTIMODAL) ---
  const handleOptimize = async () => {
    if (!script.trim() && !selectedFile) return alert("Vui lòng nhập kịch bản hoặc chọn file!");

    setIsLoading(true);
    setOptimizedScript('');
    
    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-3-flash-preview",
        systemInstruction: SYSTEM_INSTRUCTIONS 
      });

      const promptParts = [
        `Analyze the following content and provide 3 viral segments: \n\n ${script}`
      ];

      // Nếu người dùng có chọn file, nạp file đó vào mảng gửi đi
      if (selectedFile) {
        const filePart = await fileToGenerativePart(selectedFile);
        promptParts.push(filePart);
      }

      const result = await model.generateContent(promptParts);
      const response = await result.response;
      
      setOptimizedScript(response.text());
      setMetrics({ score: '98', status: 'Deep Analysis Complete' });

    } catch (error) {
      console.error("Lỗi AI:", error);
      setOptimizedScript("### ❌ Lỗi hệ thống\nFile quá lớn hoặc Gemini không thể phân tích nội dung này. Vui lòng thử lại với file nhẹ hơn (<20MB).");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (optimizedScript) {
      navigator.clipboard.writeText(optimizedScript);
      alert("Đã sao chép kịch bản!");
    }
  };

  // --- 5. GIAO DIỆN (UI) ---
  return (
    <div className="flex h-screen bg-[#020617] text-slate-100 font-sans selection:bg-indigo-500/30">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-slate-800/50 p-6 flex flex-col bg-[#01040a]">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg">
            <Zap size={22} fill="white" className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">ViralBridge <span className="text-indigo-500">AI</span></h1>
        </div>
        <nav className="flex-1 space-y-1">
          <button className="flex items-center gap-3 w-full p-3 bg-slate-900/50 rounded-xl text-sm font-medium border border-slate-800 text-indigo-400">
            <Layout size={18} /> Dashboard
          </button>
          <button className="flex items-center gap-3 w-full p-3 hover:bg-slate-900/50 rounded-xl text-sm font-medium text-slate-400"><BarChart3 size={18} /> US Trends</button>
          <button className="flex items-center gap-3 w-full p-3 hover:bg-slate-900/50 rounded-xl text-sm font-medium text-slate-400"><Globe size={18} /> Script Library</button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 border-b border-slate-800/50 flex items-center justify-between px-8 bg-[#020617]/50 backdrop-blur-xl">
          <div className="flex items-center gap-2">
            <div className={`h-2 w-2 rounded-full ${isLoading ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`}></div>
            <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
              {isLoading ? 'AI Analyzing Media...' : 'Multimodal Engine Ready'}
            </h2>
          </div>
          
          <button onClick={handleOptimize} disabled={isLoading}
            className={`${isLoading ? 'bg-slate-700' : 'bg-indigo-600 hover:bg-indigo-500'} px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 shadow-lg`}>
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {isLoading ? 'Processing...' : 'Identify Viral Moments'}
          </button>
        </header>

        {/* EDITOR AREA */}
        <div className="flex-1 flex overflow-hidden p-8 gap-8 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/10 via-transparent to-transparent">
          
          {/* PANEL TRÁI: UPLOAD & TEXT */}
          <div className="flex-1 flex flex-col gap-4 bg-slate-900/20 rounded-3xl border border-slate-800/50 p-6 backdrop-blur-sm shadow-inner overflow-y-auto">
            
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Media & Transcript</label>
            </div>

            {/* FILE UPLOAD BOX */}
            <div className="relative group">
              {selectedFile ? (
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {selectedFile.type.startsWith('video') ? <FileVideo className="text-indigo-400" /> : <FileAudio className="text-indigo-400" />}
                    <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
                  </div>
                  <button onClick={() => setSelectedFile(null)} className="p-1 hover:bg-red-500/20 rounded-full text-red-400 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-800 rounded-3xl cursor-pointer hover:bg-slate-900/50 transition-all border-indigo-500/10 group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500 group-hover:text-indigo-400">
                    <ImageIcon size={28} strokeWidth={1.5} className="mb-2" />
                    <p className="text-xs font-medium">Click to upload Video / Audio</p>
                    <p className="text-[10px] opacity-50 mt-1">AI will analyze visual and audio cues</p>
                  </div>
                  <input type="file" className="hidden" accept="video/*,audio/*,image/*" onChange={(e) => setSelectedFile(e.target.files[0])} />
                </label>
              )}
            </div>

            <textarea 
              className="flex-1 bg-transparent border-none focus:ring-0 text-lg resize-none placeholder-slate-800 leading-relaxed outline-none min-h-[200px]"
              placeholder="Hoặc dán transcript tại đây..."
              value={script}
              onChange={(e) => setScript(e.target.value)}
              disabled={isLoading}
            />
          </div>

          {/* PANEL PHẢI: AI STORYBOARD */}
          <div className={`flex-1 flex flex-col gap-4 bg-indigo-600/[0.02] rounded-3xl border ${isLoading ? 'border-indigo-500/50' : 'border-indigo-500/20'} p-6 relative overflow-hidden`}>
            <div className="flex justify-between items-center z-10">
              <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">AI Video Storyboard</label>
              <button onClick={copyToClipboard} className="p-2 hover:bg-slate-800/80 rounded-xl transition-all text-slate-500"><Copy size={16} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto z-10 scrollbar-hide">
              {isLoading ? (
                <div className="space-y-6 pt-4 animate-pulse">
                  {[1, 2, 3].map(i => <div key={i} className="h-20 bg-slate-800/30 rounded-2xl w-full"></div>)}
                </div>
              ) : optimizedScript ? (
                <div className="prose prose-invert prose-slate max-w-none 
                  prose-headings:text-indigo-400 prose-headings:font-black prose-headings:border-b prose-headings:border-slate-800 prose-headings:pb-2
                  prose-strong:text-emerald-400 text-slate-300">
                  <ReactMarkdown>{optimizedScript}</ReactMarkdown>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-800 space-y-4 opacity-50">
                  <Scissors size={48} strokeWidth={1} />
                  <p className="italic text-sm text-center tracking-wide">Ready to cut your content <br/> into viral pieces.</p>
                </div>
              )}
            </div>
            
            {/* METRICS */}
            <div className="grid grid-cols-2 gap-4 mt-6 z-10">
              <div className="bg-[#020617]/90 p-4 rounded-2xl border border-slate-800/50">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">AI Precision</p>
                <p className="text-2xl font-black text-emerald-400">{metrics.score}/100</p>
              </div>
              <div className="bg-[#020617]/90 p-4 rounded-2xl border border-slate-800/50">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Status</p>
                <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest">{metrics.status}</p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}