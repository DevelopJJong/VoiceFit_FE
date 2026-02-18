import { useEffect, useRef, useState } from 'react';

type RecorderProps = {
  onRecorded: (blob: Blob) => void;
  onError: (message: string) => void;
};

const MAX_DURATION_SECONDS = 20;

function formatSeconds(seconds: number): string {
  const clamped = Math.max(0, Math.floor(seconds));
  const mm = String(Math.floor(clamped / 60)).padStart(2, '0');
  const ss = String(clamped % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

function encodeWav(audioBuffer: AudioBuffer): ArrayBuffer {
  const numberOfChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const bitDepth = 16;
  const bytesPerSample = bitDepth / 8;
  const frameCount = audioBuffer.length;
  const blockAlign = numberOfChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = frameCount * blockAlign;

  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i += 1) {
      view.setUint8(offset + i, value.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitDepth, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;
  for (let i = 0; i < frameCount; i += 1) {
    for (let channel = 0; channel < numberOfChannels; channel += 1) {
      const sample = audioBuffer.getChannelData(channel)[i];
      const clamped = Math.max(-1, Math.min(1, sample));
      const pcm = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
      view.setInt16(offset, pcm, true);
      offset += 2;
    }
  }

  return buffer;
}

async function convertAudioBlobToWav(blob: Blob): Promise<{ wavBlob: Blob; durationSec: number }> {
  const arrayBuffer = await blob.arrayBuffer();
  const audioContext = new AudioContext();
  try {
    const decoded = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    const wavBuffer = encodeWav(decoded);
    return { wavBlob: new Blob([wavBuffer], { type: 'audio/wav' }), durationSec: decoded.duration };
  } finally {
    await audioContext.close();
  }
}

export default function Recorder({ onRecorded, onError }: RecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [permissionState, setPermissionState] = useState<'idle' | 'granted' | 'denied'>('idle');
  const [elapsedSec, setElapsedSec] = useState(0);
  const [lastDurationSec, setLastDurationSec] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const intervalRef = useRef<number | null>(null);
  const startedAtRef = useRef<number>(0);
  const isStoppingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const stopTimer = () => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const requestStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      setPermissionState('granted');
      return stream;
    } catch {
      setPermissionState('denied');
      onError('마이크 권한이 거부되었습니다. 파일 업로드로 진행해주세요.');
      return null;
    }
  };

  const startRecording = async () => {
    chunksRef.current = [];
    const stream = streamRef.current || (await requestStream());
    if (!stream) return;

    const preferredMimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/ogg',
    ];
    const supportedMimeType = preferredMimeTypes.find((type) => MediaRecorder.isTypeSupported(type));
    const recorder = supportedMimeType ? new MediaRecorder(stream, { mimeType: supportedMimeType }) : new MediaRecorder(stream);
    recorderRef.current = recorder;
    isStoppingRef.current = false;

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = async () => {
      stopTimer();
      const recordedSec = Math.min(MAX_DURATION_SECONDS, (Date.now() - startedAtRef.current) / 1000);
      setElapsedSec(recordedSec);

      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
      if (blob.size < 1000) {
        onError('녹음된 오디오가 너무 짧거나 무음입니다. 다시 녹음해주세요.');
        return;
      }

      try {
        const { wavBlob, durationSec } = await convertAudioBlobToWav(blob);
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const nextPreviewUrl = URL.createObjectURL(wavBlob);
        setPreviewUrl(nextPreviewUrl);
        setLastDurationSec(durationSec);
        onRecorded(wavBlob);
      } catch {
        onError('WAV 변환에 실패해 원본 음원으로 업로드합니다.');
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const nextPreviewUrl = URL.createObjectURL(blob);
        setPreviewUrl(nextPreviewUrl);
        setLastDurationSec(recordedSec);
        onRecorded(blob);
      }
    };

    recorder.start();
    startedAtRef.current = Date.now();
    setElapsedSec(0);
    setIsRecording(true);

    intervalRef.current = window.setInterval(() => {
      const seconds = (Date.now() - startedAtRef.current) / 1000;
      setElapsedSec(seconds);
      if (seconds >= MAX_DURATION_SECONDS && !isStoppingRef.current) {
        isStoppingRef.current = true;
        recorder.stop();
        setIsRecording(false);
      }
    }, 200);
  };

  const stopRecording = () => {
    if (!recorderRef.current || isStoppingRef.current) return;
    isStoppingRef.current = true;
    recorderRef.current.stop();
    setIsRecording(false);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">녹음하기</h2>
      <p className="mt-1 text-sm text-slate-600">최대 20초까지 녹음할 수 있고, 자동으로 WAV로 변환됩니다.</p>

      <div className="mt-4 flex items-center gap-3">
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
          >
            녹음 시작
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-rose-500"
          >
            녹음 중지
          </button>
        )}
        <span className="text-sm text-slate-500">
          {isRecording ? '녹음 중...' : permissionState === 'denied' ? '권한 거부됨' : '대기 중'}
        </span>
      </div>

      <p className="mt-3 text-sm font-medium text-slate-700">
        녹음 시간: {formatSeconds(elapsedSec)} / 00:{String(MAX_DURATION_SECONDS).padStart(2, '0')}
      </p>

      {previewUrl ? (
        <div className="mt-3 rounded-lg bg-slate-50 p-3">
          <p className="mb-2 text-sm text-slate-700">
            최근 녹음 {lastDurationSec ? `(${formatSeconds(lastDurationSec)})` : ''}
          </p>
          <audio controls src={previewUrl} className="w-full" />
        </div>
      ) : null}
    </section>
  );
}
