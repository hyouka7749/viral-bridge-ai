import { useMemo, useState } from 'react';
import { Lock, Mail, UserPlus, LogIn } from 'lucide-react';

export default function AuthPage({ supabase, onToast }) {
  const isRecovery = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return String(window.location.hash || '').includes('type=recovery') || String(window.location.hash || '').includes('type=magiclink');
  }, []);

  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const isDisabled = useMemo(() => {
    if (!supabase) return true;
    if (isRecovery) {
      if (newPassword.length < 6) return true;
      if (newPassword !== confirmNewPassword) return true;
      return isLoading;
    }
    if (!email.trim()) return true;
    if (password.length < 6) return true;
    return isLoading;
  }, [supabase, isRecovery, email, password, newPassword, confirmNewPassword, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) return onToast('Thiếu cấu hình Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).', 'error');

    setIsLoading(true);
    try {
      if (isRecovery) {
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) throw error;
        if (typeof window !== 'undefined') {
          window.history.replaceState({}, document.title, window.location.pathname + window.location.search);
        }
        setNewPassword('');
        setConfirmNewPassword('');
        onToast('Đã đổi mật khẩu thành công!');
        return;
      }
      if (tab === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onToast('Đăng nhập thành công!');
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        onToast('Đăng ký thành công! Hãy kiểm tra email để xác nhận (nếu bật).');
      }
    } catch (err) {
      onToast(err?.message || 'Đã xảy ra lỗi!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!supabase) return onToast('Thiếu cấu hình Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).', 'error');
    if (!email.trim()) return onToast('Nhập email để gửi link đặt lại mật khẩu.', 'error');
    setIsLoading(true);
    try {
      const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined;
      const { error } = await supabase.auth.resetPasswordForEmail(email, redirectTo ? { redirectTo } : undefined);
      if (error) throw error;
      onToast('Đã gửi email đặt lại mật khẩu!');
    } catch (err) {
      onToast(err?.message || 'Đã xảy ra lỗi!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 main-bg-gradient">
      <div className="w-full max-w-md bg-white/[0.03] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/[0.06]">
          <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest leading-none mb-2">HaSecTool AI</p>
          <h1 className="text-[20px] font-bold text-white tracking-tight leading-tight">
            {isRecovery ? 'Đặt lại mật khẩu' : 'Đăng nhập để dùng đầy đủ tính năng'}
          </h1>
          <p className="text-[13px] text-slate-500 mt-2 leading-relaxed">
            {isRecovery ? 'Nhập mật khẩu mới để hoàn tất.' : 'Lưu lịch sử phân tích, export và đồng bộ giữa các thiết bị.'}
          </p>
        </div>

        {!isRecovery && (
          <div className="px-6 pt-5">
            <div className="flex bg-white/[0.03] border border-white/[0.06] rounded-2xl p-1">
              {[
                { id: 'login', label: 'Đăng nhập', icon: <LogIn size={14} /> },
                { id: 'register', label: 'Đăng ký', icon: <UserPlus size={14} /> },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-all flex items-center justify-center gap-2
                    ${tab === t.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-white'}`}
                >
                  {t.icon}
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          {isRecovery ? (
            <>
              <div className="bg-white/[0.04] border border-white/[0.09] rounded-2xl flex items-center gap-3 px-4 py-3.5 focus-within:border-indigo-500/50 transition-colors">
                <Lock size={16} className="text-slate-500 shrink-0" />
                <input
                  type="password"
                  className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] outline-none text-slate-200 placeholder-slate-600 font-medium"
                  placeholder="Mật khẩu mới (>= 6 ký tự)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="bg-white/[0.04] border border-white/[0.09] rounded-2xl flex items-center gap-3 px-4 py-3.5 focus-within:border-indigo-500/50 transition-colors">
                <Lock size={16} className="text-slate-500 shrink-0" />
                <input
                  type="password"
                  className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] outline-none text-slate-200 placeholder-slate-600 font-medium"
                  placeholder="Nhập lại mật khẩu mới"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
            </>
          ) : (
            <>
              <div className="bg-white/[0.04] border border-white/[0.09] rounded-2xl flex items-center gap-3 px-4 py-3.5 focus-within:border-indigo-500/50 transition-colors">
                <Mail size={16} className="text-slate-500 shrink-0" />
                <input
                  type="email"
                  className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] outline-none text-slate-200 placeholder-slate-600 font-medium"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>

              <div className="bg-white/[0.04] border border-white/[0.09] rounded-2xl flex items-center gap-3 px-4 py-3.5 focus-within:border-indigo-500/50 transition-colors">
                <Lock size={16} className="text-slate-500 shrink-0" />
                <input
                  type="password"
                  className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] outline-none text-slate-200 placeholder-slate-600 font-medium"
                  placeholder="Mật khẩu (>= 6 ký tự)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                />
              </div>
            </>
          )}

          {!isRecovery && tab === 'login' && (
            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors"
                disabled={isLoading}
              >
                Quên mật khẩu?
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={isDisabled}
            className="w-full py-3.5 rounded-2xl font-semibold text-[14px] flex items-center justify-center gap-2.5 transition-all
              bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-[0.98]
              disabled:bg-white/5 disabled:text-slate-600 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {isRecovery ? <Lock size={16} /> : tab === 'login' ? <LogIn size={16} /> : <UserPlus size={16} />}
            {isLoading ? 'Đang xử lý...' : isRecovery ? 'Đổi mật khẩu' : tab === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
          </button>
        </form>
      </div>
    </div>
  );
}
