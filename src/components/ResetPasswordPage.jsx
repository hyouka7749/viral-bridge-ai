import { useEffect, useMemo, useState } from 'react';
import { Lock } from 'lucide-react';

export default function ResetPasswordPage({ supabase, onToast }) {
  const [isLoading, setIsLoading] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [hasRecoverySession, setHasRecoverySession] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    let unsub = null;

    const updateState = async () => {
      const { data } = await supabase.auth.getSession();
      setHasRecoverySession(Boolean(data?.session?.user));
    };

    updateState();

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setHasRecoverySession(Boolean(nextSession?.user));
    });
    unsub = data?.subscription;

    return () => unsub?.unsubscribe?.();
  }, [supabase]);

  const canSubmit = useMemo(() => {
    if (!supabase) return false;
    if (!hasRecoverySession) return false;
    if (newPassword.length < 6) return false;
    if (newPassword !== confirmNewPassword) return false;
    return !isLoading;
  }, [supabase, hasRecoverySession, newPassword, confirmNewPassword, isLoading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) return onToast?.('Thiếu cấu hình Supabase.', 'error');
    if (!hasRecoverySession) return onToast?.('Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.', 'error');

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      onToast?.('Đã đổi mật khẩu thành công!');
      if (typeof window !== 'undefined') window.location.href = '/';
    } catch (err) {
      onToast?.(err?.message || 'Đã xảy ra lỗi!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 main-bg-gradient">
      <div className="w-full max-w-md bg-white/[0.03] border border-white/[0.08] rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-white/[0.06]">
          <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest leading-none mb-2">EditTool</p>
          <h1 className="text-[20px] font-bold text-white tracking-tight leading-tight">Đổi mật khẩu</h1>
          <p className="text-[13px] text-slate-500 mt-2 leading-relaxed">
            {hasRecoverySession ? 'Nhập mật khẩu mới để hoàn tất.' : 'Mở đúng link đặt lại mật khẩu từ email để tiếp tục.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-3">
          <div className="bg-white/[0.04] border border-white/[0.09] rounded-2xl flex items-center gap-3 px-4 py-3.5 focus-within:border-indigo-500/50 transition-colors">
            <Lock size={16} className="text-slate-500 shrink-0" />
            <input
              type="password"
              className="flex-1 bg-transparent border-none focus:ring-0 text-[14px] outline-none text-slate-200 placeholder-slate-600 font-medium"
              placeholder="Mật khẩu mới (>= 6 ký tự)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              disabled={!supabase || isLoading}
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
              disabled={!supabase || isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full py-3.5 rounded-2xl font-semibold text-[14px] flex items-center justify-center gap-2.5 transition-all
              bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 active:scale-[0.98]
              disabled:bg-white/5 disabled:text-slate-600 disabled:shadow-none disabled:cursor-not-allowed"
          >
            <Lock size={16} />
            {isLoading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
}

