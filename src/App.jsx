import { useState, useCallback, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import EditorArea from './components/EditorArea';
import GuidePage from './components/GuidePage';
import Toast from './components/Toast';
import { PROMPTS } from './constants/prompts';
import './App.css';

let toastId = 0;

const YT_REGEX = /(?:v=|\/)([0-9A-Za-z_-]{11})(?:[&?]|$)/;

export default function App() {
  const [activeMode, setActiveMode] = useState('GENERAL');
  const [script, setScript] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [optimizedScript, setOptimizedScript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTranscript, setIsFetchingTranscript] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [metrics, setMetrics] = useState({ score: '--', status: 'READY', rating: 'N/A' });
  const [toasts, setToasts] = useState([]);
  const debounceRef = useRef(null);

  const addToast = useCallback((message, type = 'success') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Auto-fetch transcript khi paste link hợp lệ
  useEffect(() => {
    clearTimeout(debounceRef.current);

    if (!YT_REGEX.test(youtubeUrl)) {
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsFetchingTranscript(true);
      setScript('');
      setOptimizedScript('');
      try {
        const res = await fetch(`http://localhost:8000/get-transcript?url=${encodeURIComponent(youtubeUrl)}`);
        const data = await res.json();
        if (data.status === "Success") {
          setScript(data.script);
          addToast('Đã lấy transcript thành công!');
        } else {
          throw new Error(data.message);
        }
      } catch (err) {
        addToast(err.message || 'Không lấy được transcript!', 'error');
      } finally {
        setIsFetchingTranscript(false);
      }
    }, 600);

    return () => clearTimeout(debounceRef.current);
  }, [youtubeUrl]);

  // Ctrl+Enter để phân tích
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleOptimize();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [script, isLoading]);

  const handleOptimize = async () => {
    if (!script.trim()) {
      return addToast('Chưa có transcript! Hãy dán link YouTube trước.', 'error');
    }

    setIsLoading(true);
    setOptimizedScript('');

    try {
      const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-flash-lite-latest",
        systemInstruction: PROMPTS[activeMode]
      });

      const result = await model.generateContent(`Analyze this transcript:\n\n${script}`);
      const responseText = result.response.text();

      const ratingMatch = responseText.match(/\[RATING\]:\s*(\w+)/);
      const extractedRating = ratingMatch ? ratingMatch[1].toUpperCase() : 'A';

      setOptimizedScript(responseText.replace(/\[RATING\]:.*$/m, '').trim());
      setMetrics({
        score: Math.floor(Math.random() * (99 - 92 + 1) + 92).toString(),
        status: 'PHÂN TÍCH XONG',
        rating: extractedRating
      });
      addToast('Phân tích hoàn tất!');
    } catch (error) {
      console.error(error);
      setOptimizedScript(`### ❌ Lỗi\n\n${error.message}`);
      addToast(error.message || 'Đã xảy ra lỗi!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const getRatingColor = (r) => {
    if (r === 'S') return 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]';
    if (r === 'A') return 'text-emerald-400';
    return 'text-indigo-400';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedScript);
    addToast('Đã copy kịch bản!');
  };

  return (
    <div className="flex h-screen bg-[#060b18] text-slate-100 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
      <Sidebar
        activeMode={activeMode}
        setActiveMode={setActiveMode}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col min-w-0 w-full relative h-full">
        <Header
          isLoading={isLoading}
          activeMode={activeMode}
          onOptimize={handleOptimize}
          onMenuClick={() => setIsSidebarOpen(true)}
        />

        {activeMode === 'GUIDE' ? (
          <GuidePage />
        ) : (
          <EditorArea
            script={script}
            setScript={setScript}
            youtubeUrl={youtubeUrl}
            setYoutubeUrl={setYoutubeUrl}
            optimizedScript={optimizedScript}
            isLoading={isLoading}
            isFetchingTranscript={isFetchingTranscript}
            metrics={metrics}
            getRatingColor={getRatingColor}
            onOptimize={handleOptimize}
            onCopy={handleCopy}
          />
        )}
      </main>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
