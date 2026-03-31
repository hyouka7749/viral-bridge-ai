import { useState, useCallback, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import EditorArea from './components/EditorArea';
import GuidePage from './components/GuidePage';
import AuthPage from './components/AuthPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import Toast from './components/Toast';
import { PROMPTS } from './constants/prompts';
import { supabase } from './lib/supabaseClient';
import './App.css';

let toastId = 0;
const YT_REGEX = /(?:v=|\/)([0-9A-Za-z_-]{11})(?:[&?]|$)/;

export default function App() {
  const [activeMode, setActiveMode] = useState('GENERAL');
  const [script, setScript] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [segmentCount, setSegmentCount] = useState(3);
  const [optimizedScript, setOptimizedScript] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingTranscript, setIsFetchingTranscript] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [metrics, setMetrics] = useState({ score: '--', status: 'READY', rating: 'N/A' });
  const [toasts, setToasts] = useState([]);
  const [session, setSession] = useState(null);
  const [projects, setProjects] = useState([]);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const debounceRef = useRef(null);
  const autoOptimizeRef = useRef(null);
  const lastAutoOptimizedUrlRef = useRef('');

  const isResetPasswordRoute = (() => {
    if (typeof window === 'undefined') return false;
    return window.location.pathname === '/reset-password';
  })();

  const addToast = useCallback((message, type = 'success') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setActiveProjectIdAndPersist = useCallback((id) => {
    setActiveProjectId(id);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('activeProjectId', id || '');
    }
  }, []);

  const refreshProjects = useCallback(async (userId) => {
    if (!supabase || !userId) return;
    const { data, error } = await supabase
      .from('projects')
      .select('id, created_at, name')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      const msg = String(error.message || '');
      if (msg.includes('relation') && msg.includes('projects')) {
        addToast('Chưa tạo bảng projects trên Supabase. Hãy tạo table + bật RLS/policy trước.', 'error');
      }
      return;
    }

    const list = data || [];
    if (list.length === 0) {
      const { data: created, error: createErr } = await supabase
        .from('projects')
        .insert({ user_id: userId, name: 'Default' })
        .select('id, created_at, name')
        .single();
      if (createErr) {
        const msg2 = String(createErr.message || '');
        if (msg2.includes('new row violates row-level security policy')) {
          addToast('Supabase RLS đang chặn insert. Hãy bật policy insert/select cho bảng projects.', 'error');
        }
        setProjects([]);
        return;
      }
      setProjects([created]);
      setActiveProjectIdAndPersist(created.id);
      return;
    }

    setProjects(list);

    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('activeProjectId') : null;
    const storedValid = stored && list.some((p) => p.id === stored);
    if (storedValid) {
      setActiveProjectId(stored);
      return;
    }
    if (list[0]?.id) setActiveProjectIdAndPersist(list[0].id);
  }, [addToast, setActiveProjectIdAndPersist]);

  const createProject = useCallback(async (name) => {
    if (!supabase || !session?.user) return;
    const { data, error } = await supabase
      .from('projects')
      .insert({ user_id: session.user.id, name })
      .select('id, created_at, name')
      .single();
    if (error) {
      const msg = String(error.message || '');
      if (msg.includes('new row violates row-level security policy')) {
        addToast('Supabase RLS đang chặn insert. Hãy bật policy insert/select cho bảng projects.', 'error');
      } else if (msg.includes('relation') && msg.includes('projects')) {
        addToast('Chưa tạo bảng projects trên Supabase. Hãy tạo table + bật RLS/policy trước.', 'error');
      } else {
        addToast(msg || 'Không thể tạo project.', 'error');
      }
      throw error;
    }
    const nextProjects = [...projects, data].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    setProjects(nextProjects);
    setActiveProjectIdAndPersist(data.id);
    addToast('Đã tạo project!');
  }, [addToast, projects, session, setActiveProjectIdAndPersist]);

  const refreshAnalyses = useCallback(async (userId) => {
    if (!supabase || !userId) return;
    let query = supabase
      .from('analyses')
      .select('id, created_at, mode, youtube_url, transcript, segment_count, result_md, rating, project_id, video_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (activeProjectId) query = query.eq('project_id', activeProjectId);
    const { data, error } = await query;
    if (error) {
      const msg = String(error.message || '');
      if (msg.includes('relation') && msg.includes('analyses')) {
        addToast('Chưa tạo bảng analyses trên Supabase. Hãy tạo table + bật RLS/policy trước.', 'error');
      } else if (msg.includes('column') && msg.includes('project_id')) {
        const { data: legacyData, error: legacyErr } = await supabase
          .from('analyses')
          .select('id, created_at, mode, youtube_url, transcript, segment_count, result_md, rating')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(20);
        if (legacyErr) {
          addToast('Bảng analyses chưa có cột project_id/video_id. Hãy chạy SQL ALTER TABLE để thêm cột.', 'error');
          return;
        }
        setAnalyses(legacyData || []);
        addToast('Chưa migrate analyses theo project. Đang hiển thị lịch sử tổng.', 'error');
        return;
      }
      return;
    }
    setAnalyses(data || []);
  }, [activeProjectId, addToast]);

  useEffect(() => {
    if (!supabase) return;
    let unsub = null;
    supabase.auth.getSession().then(({ data }) => {
      const nextSession = data?.session || null;
      setSession(nextSession);
      refreshProjects(nextSession?.user?.id);
      refreshAnalyses(nextSession?.user?.id);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      refreshProjects(nextSession?.user?.id);
      refreshAnalyses(nextSession?.user?.id);
    });
    unsub = data?.subscription;
    return () => unsub?.unsubscribe?.();
  }, [refreshAnalyses, refreshProjects]);

  useEffect(() => {
    if (!session?.user) return;
    refreshAnalyses(session.user.id);
  }, [activeProjectId, refreshAnalyses, session]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const hash = String(window.location.hash || '');
    if (hash.includes('type=recovery') && window.location.pathname !== '/reset-password') {
      window.location.replace(`/reset-password${hash}`);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!session?.user) return;
    const hash = String(window.location.hash || '');
    if (hash.includes('access_token=')) {
      window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
    }
  }, [session]);

  // Khi paste URL hợp lệ → clear kết quả cũ
  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (!YT_REGEX.test(youtubeUrl)) return;
    debounceRef.current = setTimeout(() => {
      setScript('');
      setOptimizedScript('');
      setMetrics({ score: '--', status: 'READY', rating: 'N/A' });
      lastAutoOptimizedUrlRef.current = '';
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [youtubeUrl]);

  const handleOptimize = useCallback(async () => {
    if (!session?.user) {
      return addToast('Bạn cần đăng nhập để phân tích và lưu lịch sử.', 'error');
    }
    if (!activeProjectId) {
      return addToast('Chọn project trước khi phân tích.', 'error');
    }
    if (isFetchingTranscript) return;

    const hasUrl = YT_REGEX.test(youtubeUrl);
    const hasScript = script.trim().length > 0;
    const normalizedSegmentCount = (() => {
      const n = Number.parseInt(String(segmentCount), 10);
      if (!Number.isFinite(n)) return 3;
      return Math.min(10, Math.max(1, n));
    })();

    if (!hasUrl && !hasScript) {
      return addToast('Hãy dán link YouTube hoặc nhập transcript!', 'error');
    }

    setIsLoading(true);
    setOptimizedScript('');

    try {
      const systemPrompt = `${PROMPTS[activeMode] || ''}\n\nIMPORTANT OVERRIDE:\n- Output up to ${normalizedSegmentCount} segments (not 3).\n- Keep ALL constraints (especially 60–180s). If you cannot find enough segments that qualify, output only the ones that do.\n- Update the segment header numbering to match [1/${normalizedSegmentCount}], [2/${normalizedSegmentCount}], etc.`;

      let transcript = script;
      if (hasUrl && !hasScript) {
        setIsFetchingTranscript(true);
        setMetrics((prev) => ({ ...prev, status: 'ĐANG LẤY TRANSCRIPT' }));
        try {
          let cached = null;
          if (supabase) {
            const { data: cachedVideo } = await supabase
              .from('videos')
              .select('transcript')
              .eq('project_id', activeProjectId)
              .eq('youtube_url', youtubeUrl)
              .maybeSingle();
            if (cachedVideo?.transcript) cached = String(cachedVideo.transcript);
          }
          if (cached) {
            transcript = cached;
          } else {
            const res = await fetch(`/api/get-transcript?url=${encodeURIComponent(youtubeUrl)}`);
            const data = await res.json().catch(() => null);
            if (!res.ok) throw new Error(data?.message || 'Không thể lấy transcript.');
            if (!data || data.status !== 'Success') throw new Error(data?.message || 'Không thể lấy transcript.');
            transcript = String(data.script || '');
          }
          setScript(transcript);
        } finally {
          setIsFetchingTranscript(false);
        }
      }

      const userPrompt = `Analyze this transcript and output up to ${normalizedSegmentCount} segments:\n\n${transcript}`;

      setMetrics((prev) => ({ ...prev, status: 'ĐANG PHÂN TÍCH' }));
      const dsRes = await fetch('/api/deepseek-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          stream: false,
        }),
      });

      const dsJson = await dsRes.json().catch(() => null);
      if (!dsRes.ok) {
        const msg = dsJson?.error?.message || dsJson?.message || 'DeepSeek lỗi.';
        throw new Error(msg);
      }

      const responseText = dsJson?.choices?.[0]?.message?.content;
      if (!responseText || typeof responseText !== 'string') throw new Error('DeepSeek không trả về nội dung.');

      const ratingMatch = responseText.match(/\[RATING\]:\s*(\w+)/);
      const extractedRating = ratingMatch ? ratingMatch[1].toUpperCase() : 'A';

      setOptimizedScript(responseText.replace(/\[RATING\]:.*$/m, '').trim());
      setMetrics({
        score: Math.floor(Math.random() * (99 - 92 + 1) + 92).toString(),
        status: 'PHÂN TÍCH XONG',
        rating: extractedRating,
      });
      if (supabase) {
        let videoId = null;
        if (youtubeUrl) {
          try {
            const { data: existingVideo, error: findErr } = await supabase
              .from('videos')
              .select('id')
              .eq('project_id', activeProjectId)
              .eq('youtube_url', youtubeUrl)
              .maybeSingle();
            if (findErr) throw findErr;

            if (existingVideo?.id) {
              videoId = existingVideo.id;
              await supabase
                .from('videos')
                .update({ transcript: transcript || null })
                .eq('id', videoId);
            } else {
              const { data: newVideo, error: insertErr } = await supabase
                .from('videos')
                .insert({ project_id: activeProjectId, youtube_url: youtubeUrl, transcript: transcript || null })
                .select('id')
                .single();
              if (insertErr) throw insertErr;
              if (newVideo?.id) videoId = newVideo.id;
            }
          } catch (err) {
            const msg = String(err?.message || '');
            if (msg.includes('relation') && msg.includes('videos')) {
              addToast('Chưa tạo bảng videos trên Supabase. Bạn vẫn có thể lưu analyses, nhưng sẽ không nhóm theo video.', 'error');
            } else if (msg.includes('new row violates row-level security policy')) {
              addToast('Supabase RLS đang chặn insert/select bảng videos. Hãy bật policy.', 'error');
            } else if (msg) {
              addToast(msg, 'error');
            }
          }
        }

        const insertPayload = {
          user_id: session.user.id,
          project_id: activeProjectId,
          video_id: videoId,
          mode: activeMode,
          youtube_url: youtubeUrl || null,
          transcript: transcript || null,
          segment_count: normalizedSegmentCount,
          result_md: responseText,
          rating: extractedRating,
        };
        let { error } = await supabase.from('analyses').insert(insertPayload);
        if (error) {
          const msg = String(error.message || '');
          if (msg.includes('new row violates row-level security policy')) {
            addToast('Supabase RLS đang chặn insert. Hãy bật policy insert/select cho bảng analyses.', 'error');
          } else if (msg.includes('relation') && msg.includes('analyses')) {
            addToast('Chưa tạo bảng analyses trên Supabase. Hãy tạo table + bật RLS/policy trước.', 'error');
          } else if (msg.includes('column') && msg.includes('project_id')) {
            ({ error } = await supabase.from('analyses').insert({
              user_id: session.user.id,
              mode: activeMode,
              youtube_url: youtubeUrl || null,
              transcript: transcript || null,
              segment_count: normalizedSegmentCount,
              result_md: responseText,
              rating: extractedRating,
            }));
            if (error) {
              addToast('Bảng analyses chưa có cột project_id/video_id. Hãy chạy SQL ALTER TABLE để thêm cột.', 'error');
            } else {
              addToast('Chưa migrate analyses theo project. Đã lưu lịch sử (không gắn project).', 'error');
              refreshAnalyses(session.user.id);
            }
            return;
          } else {
            addToast(msg || 'Không thể lưu lịch sử.', 'error');
          }
        } else {
          refreshAnalyses(session.user.id);
        }
      }
      addToast('Phân tích hoàn tất!');
    } catch (error) {
      console.error(error);
      setOptimizedScript(`### ❌ Lỗi\n\n${error.message}`);
      addToast(error.message || 'Đã xảy ra lỗi!', 'error');
    } finally {
      setIsLoading(false);
      setIsFetchingTranscript(false);
    }
  }, [session, activeProjectId, youtubeUrl, script, segmentCount, activeMode, addToast, refreshAnalyses, isFetchingTranscript]);

  useEffect(() => {
    if (!session?.user) return;
    if (!activeProjectId) return;
    if (activeMode === 'GUIDE') return;
    if (isResetPasswordRoute) return;
    if (!YT_REGEX.test(youtubeUrl)) return;
    if (isLoading || isFetchingTranscript) return;
    if (optimizedScript.trim()) return;
    if (lastAutoOptimizedUrlRef.current === youtubeUrl) return;

    clearTimeout(autoOptimizeRef.current);
    autoOptimizeRef.current = setTimeout(() => {
      lastAutoOptimizedUrlRef.current = youtubeUrl;
      handleOptimize();
    }, 700);

    return () => clearTimeout(autoOptimizeRef.current);
  }, [session, activeProjectId, activeMode, youtubeUrl, optimizedScript, isLoading, isFetchingTranscript, isResetPasswordRoute, handleOptimize]);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') handleOptimize();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleOptimize]);

  const getRatingColor = (r) => {
    if (r === 'S') return 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]';
    if (r === 'A') return 'text-emerald-400';
    return 'text-indigo-400';
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedScript);
    addToast('Đã copy kịch bản!');
  };

  const downloadTextFile = (filename, text, mimeType) => {
    const blob = new Blob([text], { type: mimeType || 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const parseSegmentsFromMarkdown = (markdown) => {
    const text = String(markdown || '').trim();
    if (!text) return [];

    const headerRe = /^###\s*🎬\s*PHÂN\s*ĐOẠN\s*\[[^\]]+\]\s*—\s*(.+)$/gim;
    const matches = [...text.matchAll(headerRe)];
    if (matches.length === 0) return [];

    const segments = [];
    for (let i = 0; i < matches.length; i++) {
      const startIndex = matches[i].index;
      const endIndex = i + 1 < matches.length ? matches[i + 1].index : text.length;
      const block = text.slice(startIndex, endIndex).trim();
      const title = (matches[i][1] || '').trim();

      const timeMatch = block.match(/\*\s*⏰\s*\*\*Thời gian:\*\*\s*([0-9]{1,2}:[0-9]{2})\s*→\s*([0-9]{1,2}:[0-9]{2})/i);
      const durationMatch = block.match(/\*\s*⏱️\s*\*\*Thời lượng:\*\*\s*\[?(\d+)\s*s\]?/i);
      const firstMatch = block.match(/\*\s*🟢\s*\*\*Câu đầu:\*\*\s*["“](.+?)["”]/i);
      const lastMatch = block.match(/\*\s*🔴\s*\*\*Câu cuối:\*\*\s*["“](.+?)["”]/i);
      const hookMatch = block.match(/\*\s*🪝\s*\*\*Hook.*?:\*\*\s*(.+)\s*$/im);
      const captionMatch = block.match(/\*\s*📝\s*\*\*Caption:\*\*\s*(.+)\s*$/im);
      const hashtagsMatch = block.match(/\*\s*#️⃣\s*\*\*Hashtags:\*\*\s*(.+)\s*$/im);

      segments.push({
        title: title || null,
        timeStart: timeMatch ? timeMatch[1] : null,
        timeEnd: timeMatch ? timeMatch[2] : null,
        durationSeconds: durationMatch ? Number(durationMatch[1]) : null,
        firstLine: firstMatch ? firstMatch[1] : null,
        lastLine: lastMatch ? lastMatch[1] : null,
        hookText: hookMatch ? hookMatch[1].trim() : null,
        caption: captionMatch ? captionMatch[1].trim() : null,
        hashtags: hashtagsMatch ? hashtagsMatch[1].trim() : null,
        markdown: block,
      });
    }
    return segments;
  };

  const handleExportMarkdown = () => {
    if (!optimizedScript.trim()) return addToast('Chưa có kết quả để xuất!', 'error');
    const safeMode = String(activeMode || 'RESULT').toLowerCase();
    const iso = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    downloadTextFile(`viral-segments_${safeMode}_${iso}.md`, optimizedScript, 'text/markdown;charset=utf-8');
    addToast('Đã xuất file Markdown (.md)!');
  };

  const handleExportJson = () => {
    if (!optimizedScript.trim()) return addToast('Chưa có kết quả để xuất!', 'error');
    const segments = parseSegmentsFromMarkdown(optimizedScript);
    const payload = {
      activeMode,
      rating: metrics.rating,
      exportedAt: new Date().toISOString(),
      segments,
    };
    const iso = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
    downloadTextFile(`viral-segments_${String(activeMode || 'RESULT').toLowerCase()}_${iso}.json`, JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
    addToast('Đã xuất file JSON (.json)!');
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    addToast('Đã đăng xuất!');
  };

  const handleLoadAnalysis = (id) => {
    const a = analyses.find((x) => x.id === id);
    if (!a) return;
    if (a.project_id) setActiveProjectIdAndPersist(a.project_id);
    setActiveMode(a.mode || 'GENERAL');
    setYoutubeUrl(a.youtube_url || '');
    setScript(a.transcript || '');
    setSegmentCount(a.segment_count || 3);
    setOptimizedScript(a.result_md || '');
    setMetrics((prev) => ({ ...prev, status: 'ĐÃ TẢI', rating: a.rating || prev.rating }));
    addToast('Đã tải từ lịch sử!');
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
          userEmail={session?.user?.email || null}
          onSignOut={session?.user ? handleSignOut : null}
        />

        {isResetPasswordRoute ? (
          <ResetPasswordPage supabase={supabase} onToast={addToast} />
        ) : activeMode === 'GUIDE' ? (
          <GuidePage />
        ) : !session?.user ? (
          <AuthPage supabase={supabase} onToast={addToast} />
        ) : (
          <EditorArea
            script={script}
            setScript={setScript}
            youtubeUrl={youtubeUrl}
            setYoutubeUrl={setYoutubeUrl}
            segmentCount={segmentCount}
            setSegmentCount={setSegmentCount}
            optimizedScript={optimizedScript}
            isLoading={isLoading}
            isFetchingTranscript={isFetchingTranscript}
            metrics={metrics}
            getRatingColor={getRatingColor}
            onOptimize={handleOptimize}
            onCopy={handleCopy}
            onExportMarkdown={handleExportMarkdown}
            onExportJson={handleExportJson}
            userEmail={session?.user?.email || null}
            analyses={analyses}
            onLoadAnalysis={handleLoadAnalysis}
            projects={projects}
            activeProjectId={activeProjectId}
            onSetActiveProjectId={setActiveProjectIdAndPersist}
            onCreateProject={createProject}
          />
        )}
      </main>

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
