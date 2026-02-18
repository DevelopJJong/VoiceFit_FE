import { useState } from 'react';
import type { SignupPayload } from '../types';

type SignupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSignup: (payload: SignupPayload) => Promise<void>;
};

export default function SignupModal({ isOpen, onClose, onSignup }: SignupModalProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const runSignup = async () => {
    if (!name || !email || !password) {
      setError('이름, 이메일, 비밀번호를 모두 입력해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      await onSignup({ name, email, password });
      onClose();
    } catch (signupError) {
      const message = signupError instanceof Error ? signupError.message : '회원가입 처리 중 오류가 발생했습니다.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">회원가입</h2>
          <button type="button" onClick={onClose} className="rounded-lg px-2 py-1 text-sm text-slate-500 hover:bg-slate-100">
            닫기
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none ring-cyan-600 focus:ring-2"
          />
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
            onClick={runSignup}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:bg-slate-400"
          >
            {isLoading ? '처리 중...' : '회원가입'}
          </button>
        </div>

        {error ? <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}
      </section>
    </div>
  );
}
