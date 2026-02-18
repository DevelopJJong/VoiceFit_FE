import { useState } from 'react';
import FileUploader from './FileUploader';
import Recorder from './Recorder';
import type { AnalyzeVoiceParams, VocalRangeMode } from '../types';

type AnalyzeUploaderProps = {
  isLoading: boolean;
  onAnalyze: (params: AnalyzeVoiceParams) => void;
};

const MIN_DURATION_SECONDS = 3;
const MAX_DURATION_SECONDS = 20;
const MAX_FILE_BYTES = 5 * 1024 * 1024;

function formatSize(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

function readAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const audio = document.createElement('audio');
    audio.preload = 'metadata';
    audio.src = url;

    audio.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(audio.duration || 0);
    };

    audio.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('오디오 길이를 확인할 수 없습니다.'));
    };
  });
}

function validateWavAndSize(file: File): string | null {
  if (file.type !== 'audio/wav') {
    return 'audio/wav 형식만 업로드할 수 있습니다.';
  }
  if (file.size > MAX_FILE_BYTES) {
    return `파일 용량은 5MB 이하여야 합니다. (현재 ${formatSize(file.size)})`;
  }
  return null;
}

export default function AnalyzeUploader({ isLoading, onAnalyze }: AnalyzeUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [vocalRangeMode, setVocalRangeMode] = useState<VocalRangeMode>('any');
  const [allowCrossGender, setAllowCrossGender] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [durationSec, setDurationSec] = useState<number | null>(null);

  const assignValidatedFile = async (candidate: File) => {
    const baseError = validateWavAndSize(candidate);
    if (baseError) {
      setFile(null);
      setDurationSec(null);
      setLocalError(baseError);
      return;
    }

    try {
      const duration = await readAudioDuration(candidate);
      if (duration < MIN_DURATION_SECONDS || duration > MAX_DURATION_SECONDS) {
        setFile(null);
        setDurationSec(null);
        setLocalError(
          `오디오 길이는 ${MIN_DURATION_SECONDS}초 이상 ${MAX_DURATION_SECONDS}초 이하여야 합니다. (현재 ${duration.toFixed(1)}초)`,
        );
        return;
      }
      setFile(candidate);
      setDurationSec(duration);
      setLocalError(null);
    } catch (error) {
      setFile(null);
      setDurationSec(null);
      setLocalError(error instanceof Error ? error.message : '오디오 파일 검증에 실패했습니다.');
    }
  };

  const handleRecorded = (blob: Blob) => {
    const recordedFile = new File([blob], `voicefit-recording-${Date.now()}.wav`, {
      type: 'audio/wav',
    });
    void assignValidatedFile(recordedFile);
  };

  const handleFileSelected = (selectedFile: File) => {
    void assignValidatedFile(selectedFile);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">음성 업로드 및 분석</h2>
      <p className="mt-1 text-sm text-slate-600">녹음 또는 파일 업로드 후 분석 옵션을 선택하세요.</p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Recorder onRecorded={handleRecorded} onError={setLocalError} />
        <FileUploader onSelectFile={handleFileSelected} />
      </div>

      <div className="mt-4 space-y-4">
        <div>
          <p className="mb-1 block text-sm font-medium text-slate-700">분석 대상 파일</p>
          <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{file?.name ?? '아직 선택되지 않았습니다.'}</p>
          {file ? (
            <p className="mt-1 text-xs text-slate-500">
              형식: {file.type} | 용량: {formatSize(file.size)} | 길이: {durationSec?.toFixed(1) ?? '-'}초
            </p>
          ) : null}
          {localError ? <p className="mt-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{localError}</p> : null}
        </div>

        <div>
          <label htmlFor="vocal-range" className="mb-1 block text-sm font-medium text-slate-700">
            보컬 성별 설정
          </label>
          <select
            id="vocal-range"
            value={vocalRangeMode}
            onChange={(event) => setVocalRangeMode(event.target.value as VocalRangeMode)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none ring-cyan-600 focus:ring-2"
          >
            <option value="any">전체(자동 추천)</option>
            <option value="male">남성 보컬 기준</option>
            <option value="female">여성 보컬 기준</option>
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={allowCrossGender}
            onChange={(event) => setAllowCrossGender(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-cyan-700 focus:ring-cyan-600"
          />
          교차 성별 곡도 추천에 포함
        </label>

        <button
          type="button"
          disabled={isLoading || !file}
          onClick={async () => {
            if (!file) return;

            const baseError = validateWavAndSize(file);
            if (baseError) {
              setLocalError(baseError);
              return;
            }

            try {
              const duration = await readAudioDuration(file);
              if (duration < MIN_DURATION_SECONDS || duration > MAX_DURATION_SECONDS) {
                setLocalError(
                  `오디오 길이는 ${MIN_DURATION_SECONDS}초 이상 ${MAX_DURATION_SECONDS}초 이하여야 합니다. (현재 ${duration.toFixed(1)}초)`,
                );
                return;
              }
              setDurationSec(duration);
              setLocalError(null);
              onAnalyze({ file, vocalRangeMode, allowCrossGender, mock: false });
            } catch {
              setLocalError('오디오 길이를 확인할 수 없습니다.');
            }
          }}
          className="rounded-lg bg-cyan-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {isLoading ? '분석 중...' : '보이스핏 분석 시작'}
        </button>
      </div>
    </section>
  );
}
