import { useEffect, useMemo, useState } from 'react';
import { loginWithEmail, loginWithSocial, logout, signupWithEmail } from '../services/auth';
import { addAnalysisRecord, addCreditEvent, addPrecisionEvent, loadAnalysisHistory, loadCreditEvents, loadPrecisionEvents } from '../services/history';
import { analyzeVoice, VoicefitApiError } from '../services/voicefit';
import AnalyzeUploader from '../components/AnalyzeUploader';
import AnalysisHistory from '../components/AnalysisHistory';
import AuthModal from '../components/AuthModal';
import MyPage from '../components/MyPage';
import PremiumAccess from '../components/PremiumAccess';
import ProfileBars from '../components/ProfileBars';
import RecordingGuide from '../components/RecordingGuide';
import Recommendations from '../components/Recommendations';
import ShareProfileCard from '../components/ShareProfileCard';
import SignupModal from '../components/SignupModal';
import type {
  AnalysisRecord,
  AnalyzeResponse,
  AnalyzeVoiceParams,
  CreditEvent,
  LoginCredentials,
  PrecisionEvent,
  PrecisionPlan,
  SignupPayload,
  SocialProvider,
} from '../types';

const NO_MOCK_FALLBACK_CODES = new Set([
  'UNSUPPORTED_FORMAT',
  'FILE_TOO_LARGE',
  'EMPTY_FILE',
  'INVALID_WAV',
  'UNSUPPORTED_WAV_ENCODING',
  'AUDIO_DECODE_ERROR',
  'INVALID_AUDIO_SIGNAL',
  'AUDIO_TOO_SHORT',
  'SILENT_AUDIO',
  'NON_VOCAL_INPUT',
  'INVALID_BOOLEAN',
  'INVALID_VOCAL_RANGE_MODE',
]);

type ViewMode = 'analyze' | 'premium' | 'mypage';

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginLabel, setLoginLabel] = useState('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const [viewMode, setViewMode] = useState<ViewMode>('analyze');
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<AnalysisRecord[]>([]);
  const [creditEvents, setCreditEvents] = useState<CreditEvent[]>([]);
  const [precisionEvents, setPrecisionEvents] = useState<PrecisionEvent[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setAnalysisHistory(loadAnalysisHistory());
    setCreditEvents(loadCreditEvents());
    setPrecisionEvents(loadPrecisionEvents());
  }, []);

  const credits = useMemo(() => {
    return creditEvents.reduce((sum, event) => (event.type === 'charge' ? sum + event.amount : sum - event.amount), 0);
  }, [creditEvents]);

  const pushCreditEvent = (event: CreditEvent) => {
    const next = addCreditEvent(event);
    setCreditEvents(next);
  };

  const pushPrecisionEvent = (event: PrecisionEvent) => {
    const next = addPrecisionEvent(event);
    setPrecisionEvents(next);
  };

  const pushAnalysisRecord = (source: 'api' | 'mock', data: AnalyzeResponse) => {
    const next = addAnalysisRecord({
      id: createId('analysis'),
      created_at: new Date().toISOString(),
      source,
      result: data,
    });
    setAnalysisHistory(next);
  };

  const handleEmailLogin = async (payload: LoginCredentials) => {
    try {
      await loginWithEmail(payload);
      setIsLoggedIn(true);
      setLoginLabel(payload.email);
      setNotice(null);
    } catch {
      setIsLoggedIn(true);
      setLoginLabel(payload.email);
      setNotice('현재 로그인 기능은 준비 중입니다. 임시 로그인 상태로 이용할 수 있습니다.');
    }
  };

  const handleSignup = async (payload: SignupPayload) => {
    try {
      await signupWithEmail(payload);
      setIsLoggedIn(true);
      setLoginLabel(payload.name || payload.email);
      setNotice(null);
    } catch {
      setIsLoggedIn(true);
      setLoginLabel(payload.name || payload.email);
      setNotice('현재 회원가입 기능은 준비 중입니다. 임시 계정 상태로 이용할 수 있습니다.');
    }
  };

  const handleSocialLogin = async (provider: SocialProvider) => {
    try {
      await loginWithSocial(provider);
      setIsLoggedIn(true);
      setLoginLabel(`${provider} 계정`);
      setNotice(null);
    } catch {
      setIsLoggedIn(true);
      setLoginLabel(`${provider} 계정`);
      setNotice('소셜 로그인 연동 전입니다. 임시 로그인 상태로 이용할 수 있습니다.');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Keep UX smooth while backend logout is not connected.
    }
    setIsLoggedIn(false);
    setLoginLabel('');
    setViewMode('analyze');
  };

  const addCredits = (amount: number) => {
    pushCreditEvent({
      id: createId('credit'),
      created_at: new Date().toISOString(),
      type: 'charge',
      amount,
      note: `크레딧 충전 +${amount}`,
    });
    setNotice(`${amount} 크레딧이 충전되었습니다.`);
  };

  const consumeOneCredit = () => {
    if (credits < 1) return false;
    pushCreditEvent({
      id: createId('credit'),
      created_at: new Date().toISOString(),
      type: 'use',
      amount: 1,
      note: '정밀 분석 1회 사용',
    });
    return true;
  };

  const handleRunPrecision = (plan: PrecisionPlan, usedCredit: number) => {
    pushPrecisionEvent({
      id: createId('precision'),
      created_at: new Date().toISOString(),
      plan,
      used_credit: usedCredit,
      status: 'requested',
    });
  };

  const handleAnalyze = async (params: AnalyzeVoiceParams) => {
    setIsLoading(true);
    setError(null);
    setNotice(null);

    try {
      const data = await analyzeVoice(params);
      setResult(data);
      pushAnalysisRecord('api', data);
    } catch (analyzeError) {
      if (analyzeError instanceof VoicefitApiError && analyzeError.code && NO_MOCK_FALLBACK_CODES.has(analyzeError.code)) {
        setResult(null);
        setError(analyzeError.message);
        return;
      }

      try {
        const fallbackData = await analyzeVoice({ ...params, mock: true });
        setResult(fallbackData);
        pushAnalysisRecord('mock', fallbackData);
        setNotice('분석 서버가 불안정하여 임시 추천 결과를 보여드리고 있습니다.');
      } catch {
        const message = analyzeError instanceof Error ? analyzeError.message : '분석 요청 중 오류가 발생했습니다.';
        setResult(null);
        setError(message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromHistory = (record: AnalysisRecord) => {
    setResult(record.result);
    setViewMode('analyze');
    setNotice('선택한 히스토리 결과를 불러왔습니다.');
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e0f2fe_0%,_#f8fafc_40%,_#f1f5f9_100%)] px-4 py-8 text-slate-800">
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onOpenSignup={() => setIsSignupModalOpen(true)}
        onEmailLogin={handleEmailLogin}
        onSocialLogin={handleSocialLogin}
      />
      <SignupModal isOpen={isSignupModalOpen} onClose={() => setIsSignupModalOpen(false)} onSignup={handleSignup} />

      <main className="mx-auto w-full max-w-5xl space-y-6">
        <header className="rounded-2xl border border-white/60 bg-white/70 px-5 py-4 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src="/voicefit-logo.png" alt="VoiceFit 로고" className="h-11 w-11 rounded-xl object-cover" />
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">VoiceFit - 맞춤 곡 추천 AI</h1>
                <p className="text-xs text-slate-500">음색 분석 후 내 목소리에 딱 맞는 곡 추천 AI 서비스</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isLoggedIn ? (
                <>
                  <button type="button" onClick={() => setViewMode('mypage')} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    마이페이지
                  </button>
                  <button type="button" onClick={handleLogout} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700">
                    로그아웃
                  </button>
                </>
              ) : (
                <button type="button" onClick={() => setIsAuthModalOpen(true)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                  로그인
                </button>
              )}
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
            {isLoggedIn ? `환영합니다, ${loginLabel || '사용자'}님` : '로그인 후 맞춤 추천을 더 정확히 받아보세요.'}
          </div>
        </header>

        {viewMode !== 'mypage' ? (
          <nav className="flex gap-2 rounded-2xl border border-slate-200 bg-white/90 p-2 shadow-sm">
            <button type="button" onClick={() => setViewMode('analyze')} className={`rounded-xl px-4 py-2 text-sm font-semibold ${viewMode === 'analyze' ? 'bg-cyan-700 text-white' : 'bg-white text-slate-700'}`}>
              음성 분석
            </button>
            <button type="button" onClick={() => setViewMode('premium')} className={`rounded-xl px-4 py-2 text-sm font-semibold ${viewMode === 'premium' ? 'bg-cyan-700 text-white' : 'bg-white text-slate-700'}`}>
              정밀 플랜
            </button>
          </nav>
        ) : null}

        {viewMode === 'mypage' && isLoggedIn ? (
          <MyPage
            userLabel={loginLabel || '사용자'}
            credits={credits}
            creditEvents={creditEvents}
            precisionEvents={precisionEvents}
            recentRecords={analysisHistory}
            onAddCredits={addCredits}
            onBack={() => setViewMode('analyze')}
            onLoadRecord={loadFromHistory}
          />
        ) : null}

        {viewMode === 'premium' ? (
          <PremiumAccess
            isLoggedIn={isLoggedIn}
            credits={credits}
            onConsumeCredit={consumeOneCredit}
            onRunPrecision={handleRunPrecision}
          />
        ) : null}

        {viewMode === 'analyze' ? (
          <>
            <AnalyzeUploader isLoading={isLoading} onAnalyze={handleAnalyze} />
            {isLoading ? (
              <section className="rounded-2xl border border-cyan-200 bg-cyan-50/90 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-300 border-t-cyan-700" />
                  <div>
                    <p className="text-sm font-semibold text-cyan-900">음성 분석 진행 중</p>
                    <p className="text-xs text-cyan-700">추천 이유 생성 단계에서 시간이 조금 더 걸릴 수 있습니다.</p>
                  </div>
                </div>
              </section>
            ) : null}
            <RecordingGuide errorMessage={error} />
            <AnalysisHistory records={analysisHistory} onLoadRecord={loadFromHistory} />

            {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">오류: {error}</p> : null}
            {notice ? <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">{notice}</p> : null}

            {result ? (
              <section className="space-y-4">
                <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-slate-900">분석 요약</h2>
                    <div className="flex items-center gap-2">
                      <ShareProfileCard profile={result.profile} summary={result.summary} />
                      <span className="rounded-full bg-cyan-700 px-3 py-1 text-xs font-semibold text-white">
                        신뢰도 {Math.round(result.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                  <p className="mt-2 text-slate-700">{result.summary}</p>
                  <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-700">
                    <p>길이: {result.input_info.duration_sec}s</p>
                    <p>신호 품질: {result.input_info.signal_quality}</p>
                    <p>{result.input_info.note}</p>
                  </div>
                </section>

                <ProfileBars profile={result.profile} />
                <Recommendations recommendations={result.recommendations} />
              </section>
            ) : null}
          </>
        ) : null}
      </main>
    </div>
  );
}
