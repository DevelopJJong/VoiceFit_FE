import { useState } from 'react';
import { analyzeVoice } from '../api/client';
import FileUploader from '../components/FileUploader';
import ProfileBars from '../components/ProfileBars';
import Recorder from '../components/Recorder';
import Recommendations from '../components/Recommendations';
import type { AnalyzeResponse } from '../types';

export default function Home() {
  const [selectedAudio, setSelectedAudio] = useState<Blob | File | null>(null);
  const [selectedName, setSelectedName] = useState<string>('');
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mockNotice, setMockNotice] = useState<string | null>(null);

  const handleRecorded = (blob: Blob) => {
    setSelectedAudio(blob);
    setSelectedName(`recorded-${new Date().toISOString()}.webm`);
    setError(null);
    setMockNotice(null);
  };

  const handleUploaded = (file: File) => {
    setSelectedAudio(file);
    setSelectedName(file.name);
    setError(null);
    setMockNotice(null);
  };

  const handleAnalyze = async () => {
    if (!selectedAudio) {
      setError('먼저 녹음하거나 파일을 업로드해주세요.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMockNotice(null);

    try {
      const response = await analyzeVoice(selectedAudio);
      setResult(response.data);
      if (response.usedMock) {
        setMockNotice(`Mock 결과 표시 중: ${response.fallbackReason ?? 'API fallback'}`);
      }
    } catch {
      setResult(null);
      setError('분석 요청 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#e0f2fe_0%,_#f8fafc_40%,_#f1f5f9_100%)] px-4 py-8 text-slate-800">
      <main className="mx-auto w-full max-w-5xl space-y-6">
        <header className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/70 px-5 py-4 shadow-sm backdrop-blur">
          <h1 className="text-2xl font-black tracking-tight text-slate-900">VoiceFit</h1>
          <p className="text-sm text-slate-600">당신의 음색에 맞는 추천</p>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <Recorder onRecorded={handleRecorded} onError={setError} />
          <FileUploader onSelectFile={handleUploaded} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">분석 요청</h2>
          <p className="mt-1 text-sm text-slate-600">선택된 오디오: {selectedName || '없음'}</p>
          <button
            type="button"
            disabled={isLoading}
            onClick={handleAnalyze}
            className="mt-4 rounded-lg bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isLoading ? '분석 중...' : '분석 요청'}
          </button>
          {error ? (
            <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">오류: {error}</p>
          ) : null}
          {mockNotice ? (
            <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{mockNotice}</p>
          ) : null}
        </section>

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
            <div className="grid gap-4 md:grid-cols-2">
              <ProfileBars profile={result.profile} />
              <Recommendations recommendations={result.recommendations} />
            </div>
          </section>
        ) : null}

        <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">How it works</h2>
          <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-slate-700">
            <li>마이크로 녹음하거나 오디오 파일을 업로드합니다.</li>
            <li>선택된 파일을 `multipart/form-data`로 `/analyze`에 전송합니다.</li>
            <li>API 실패 또는 mockMode=true 시 mock JSON으로 렌더링합니다.</li>
          </ol>
        </section>
      </main>
    </div>
  );
}
