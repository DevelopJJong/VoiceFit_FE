import { useState } from 'react';
import type { ReactNode } from 'react';
import type { LoginCredentials, SocialProvider } from '../types';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onOpenSignup: () => void;
  onEmailLogin: (payload: LoginCredentials) => Promise<void>;
  onSocialLogin: (provider: SocialProvider) => Promise<void>;
};

const GOOGLE_ICON = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.2-.9 2.2-2 2.9l3.2 2.5c1.9-1.7 3-4.2 3-7.3 0-.7-.1-1.4-.2-2H12z" />
    <path fill="#34A853" d="M6.8 14.3 6 15l-2.8 2.2A10 10 0 0 0 12 22c2.7 0 5-1 6.7-2.6l-3.2-2.5c-.9.6-2.1 1-3.5 1-2.7 0-5-1.8-5.8-4.3z" />
    <path fill="#4A90E2" d="M3.2 6.8A10 10 0 0 0 2 12c0 1.8.4 3.5 1.2 5.2l3.6-2.9A6 6 0 0 1 6.5 12c0-.8.2-1.6.4-2.3z" />
    <path fill="#FBBC05" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 12 2a10 10 0 0 0-8.8 4.8l3.3 2.9C7 7.7 9.3 5.9 12 5.9z" />
  </svg>
);

const KAKAO_ICON = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <path
      fill="#191919"
      d="M12 3C6.8 3 2.5 6.3 2.5 10.5c0 2.6 1.6 4.9 4 6.3L5.7 21l4.5-2.9c.6.1 1.2.2 1.8.2 5.2 0 9.5-3.3 9.5-7.5S17.2 3 12 3z"
    />
  </svg>
);

const NAVER_ICON = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
    <rect x="2" y="2" width="20" height="20" rx="3" fill="#03C75A" />
    <path fill="#fff" d="M8 7h3.2l4 5.7V7H18v10h-3.1l-4.1-5.9V17H8z" />
  </svg>
);

const SOCIAL_BUTTONS: { provider: SocialProvider; label: string; className: string; icon: ReactNode }[] = [
  { provider: 'google', label: 'Google로 계속하기', className: 'bg-white text-slate-700 border border-slate-300', icon: GOOGLE_ICON },
  { provider: 'kakao', label: 'Kakao로 계속하기', className: 'bg-yellow-300 text-slate-900', icon: KAKAO_ICON },
  { provider: 'naver', label: 'Naver로 계속하기', className: 'bg-emerald-500 text-white', icon: NAVER_ICON },
];

export default function AuthModal({ isOpen, onClose, onOpenSignup, onEmailLogin, onSocialLogin }: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const runEmailLogin = async () => {
    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onEmailLogin({ email, password });
      onClose();
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : '로그인 처리 중 오류가 발생했습니다.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const runSocialLogin = async (provider: SocialProvider) => {
    setIsLoading(true);
    setError(null);
    try {
      await onSocialLogin(provider);
      onClose();
    } catch (loginError) {
      const message = loginError instanceof Error ? loginError.message : '소셜 로그인 처리 중 오류가 발생했습니다.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">로그인</h2>
          <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100">
            닫기
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-cyan-600 focus:ring-2"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-cyan-600 focus:ring-2"
          />
          <button
            type="button"
            disabled={isLoading}
            onClick={runEmailLogin}
            className="w-full rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600 disabled:bg-slate-400"
          >
            {isLoading ? '처리 중...' : '로그인'}
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSignup();
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            회원가입
          </button>
        </div>

        <div className="my-4 border-t border-slate-200" />

        <div className="space-y-2">
          {SOCIAL_BUTTONS.map((item) => (
            <button
              key={item.provider}
              type="button"
              disabled={isLoading}
              onClick={() => runSocialLogin(item.provider)}
              className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ${item.className} disabled:bg-slate-300`}
            >
              {item.icon}
              <span>{isLoading ? '처리 중...' : item.label}</span>
            </button>
          ))}
        </div>

        {error ? <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      </section>
    </div>
  );
}
