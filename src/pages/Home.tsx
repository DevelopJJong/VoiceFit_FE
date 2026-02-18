import { useState } from 'react';
import { analyzeVoice, VoicefitApiError } from '../services/voicefit';
import AnalyzeUploader from '../components/AnalyzeUploader';
import ProfileBars from '../components/ProfileBars';
import Recommendations from '../components/Recommendations';
import type { AnalyzeResponse, AnalyzeVoiceParams } from '../types';

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

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleAnalyze = async (params: AnalyzeVoiceParams) => {
    setIsLoading(true);
    setError(null);
    setNotice(null);

    try {
      const data = await analyzeVoice(params);
      setResult(data);
    } catch (analyzeError) {
      if (analyzeError instanceof VoicefitApiError && analyzeError.code && NO_MOCK_FALLBACK_CODES.has(analyzeError.code)) {
        setResult(null);
        setError(analyzeError.message);
        return;
      }

      try {
        const fallbackData = await analyzeVoice({ ...params, mock: true });
        setResult(fallbackData);
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

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e0f2fe_0%,_#f8fafc_40%,_#f1f5f9_100%)] px-4 py-8 text-slate-800">
      <main className="mx-auto w-full max-w-5xl space-y-6">
        <header className="rounded-2xl border border-white/60 bg-white/70 px-5 py-4 shadow-sm backdrop-blur">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src="/voicepick-logo.png" alt="VoicePick 로고" className="h-11 w-11 rounded-xl object-cover" />
              <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900">VoicePick</h1>
                <p className="text-xs text-slate-500">내 목소리에 딱 맞는 곡 추천 서비스</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsLoggedIn(true)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                로그인
              </button>
              <button
                type="button"
                onClick={() => setIsLoggedIn(false)}
                className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-700"
              >
                로그아웃
              </button>
            </div>
          </div>
          <div className="mt-3 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
            {isLoggedIn ? '환영합니다, 사용자님' : '로그인 후 맞춤 추천을 더 정확히 받아보세요.'}
          </div>
        </header>

        <AnalyzeUploader isLoading={isLoading} onAnalyze={handleAnalyze} />

        {error ? <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">오류: {error}</p> : null}
        {notice ? <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">{notice}</p> : null}

        {result ? (
          <section className="space-y-4">
            <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-slate-900">분석 요약</h2>
                <span className="rounded-full bg-cyan-700 px-3 py-1 text-xs font-semibold text-white">
                  Confidence {Math.round(result.confidence * 100)}%
                </span>
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
      </main>
    </div>
  );
}
