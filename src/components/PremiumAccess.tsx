import { useMemo, useState } from 'react';
import type { PrecisionPlan } from '../types';

type PremiumAccessProps = {
  isLoggedIn: boolean;
  credits: number;
  onRunPrecision: (plan: PrecisionPlan, usedCredit: number) => void;
  onConsumeCredit: () => boolean;
};

const PLAN_LABEL: Record<PrecisionPlan, string> = {
  free: 'Free',
  plus: 'Plus',
  pro: 'Pro',
};

export default function PremiumAccess({ isLoggedIn, credits, onRunPrecision, onConsumeCredit }: PremiumAccessProps) {
  const [selectedPlan, setSelectedPlan] = useState<PrecisionPlan>('free');
  const [message, setMessage] = useState('');

  const precisionLabel = useMemo(() => {
    if (selectedPlan === 'pro') return '정밀도 높음';
    if (selectedPlan === 'plus') return '정밀도 향상';
    return '기본 정밀도';
  }, [selectedPlan]);

  const handleUpgrade = (plan: PrecisionPlan) => {
    setSelectedPlan(plan);
    if (plan === 'free') {
      setMessage('현재 Free 플랜입니다.');
    } else {
      setMessage(`${PLAN_LABEL[plan]} 플랜 체험 상태로 전환되었습니다. (임시)`);
    }
  };

  const handleRunPrecision = () => {
    if (!isLoggedIn) {
      setMessage('정밀 분석은 로그인 후 이용 가능합니다.');
      return;
    }

    if (selectedPlan === 'free') {
      const consumed = onConsumeCredit();
      if (!consumed) {
        setMessage('크레딧이 부족합니다. 마이페이지에서 크레딧을 충전해주세요.');
        return;
      }
      onRunPrecision(selectedPlan, 1);
    } else {
      onRunPrecision(selectedPlan, 0);
    }

    setMessage('정밀 분석 요청이 접수되었습니다. 백엔드 연결 후 실제 결과가 제공됩니다.');
  };

  return (
    <section className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">정밀 분석 플랜</h2>
        <p className="mt-1 text-sm text-slate-600">더 정확한 추천을 위한 구독/크레딧 화면입니다.</p>

        <div className="mt-4 grid gap-3 md:grid-cols-3">
          <article className={`rounded-xl border p-4 ${selectedPlan === 'free' ? 'border-cyan-600 bg-cyan-50' : 'border-slate-200 bg-slate-50'}`}>
            <h3 className="font-semibold text-slate-900">Free</h3>
            <p className="mt-1 text-sm text-slate-600">기본 분석 + 1크레딧 사용</p>
            <button type="button" onClick={() => handleUpgrade('free')} className="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">선택</button>
          </article>

          <article className={`rounded-xl border p-4 ${selectedPlan === 'plus' ? 'border-cyan-600 bg-cyan-50' : 'border-slate-200 bg-slate-50'}`}>
            <h3 className="font-semibold text-slate-900">Plus</h3>
            <p className="mt-1 text-sm text-slate-600">월 구독형, 정밀도 향상</p>
            <button type="button" onClick={() => handleUpgrade('plus')} className="mt-3 rounded-lg bg-cyan-700 px-3 py-2 text-sm text-white">체험 시작</button>
          </article>

          <article className={`rounded-xl border p-4 ${selectedPlan === 'pro' ? 'border-cyan-600 bg-cyan-50' : 'border-slate-200 bg-slate-50'}`}>
            <h3 className="font-semibold text-slate-900">Pro</h3>
            <p className="mt-1 text-sm text-slate-600">월 구독형, 최고 정밀도</p>
            <button type="button" onClick={() => handleUpgrade('pro')} className="mt-3 rounded-lg bg-slate-900 px-3 py-2 text-sm text-white">체험 시작</button>
          </article>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">정밀 분석 실행</h2>
        <p className="mt-1 text-sm text-slate-600">현재 보유 크레딧: {credits}</p>
        <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
          <p>현재 플랜: {PLAN_LABEL[selectedPlan]}</p>
          <p>예상 분석 품질: {precisionLabel}</p>
          <p className="mt-1 text-xs text-slate-500">크레딧 충전은 마이페이지에서 가능합니다.</p>
        </div>

        <button type="button" onClick={handleRunPrecision} className="mt-4 rounded-lg bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-600">
          더 정확한 결과 보기
        </button>

        {message ? <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">{message}</p> : null}
      </section>
    </section>
  );
}
