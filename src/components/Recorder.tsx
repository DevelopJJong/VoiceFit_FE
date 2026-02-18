import { useRef, useState } from 'react';

type RecorderProps = {
  onRecorded: (blob: Blob) => void;
  onError: (message: string) => void;
};

export default function Recorder({ onRecorded, onError }: RecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [permissionState, setPermissionState] = useState<'idle' | 'granted' | 'denied'>('idle');
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

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

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRef.current.push(event.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
      if (blob.size < 1000) {
        onError('녹음된 오디오가 너무 짧거나 무음입니다. 다시 녹음해주세요.');
        return;
      }
      onRecorded(blob);
    };

    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (!recorderRef.current) return;
    recorderRef.current.stop();
    setIsRecording(false);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">녹음하기</h2>
      <p className="mt-1 text-sm text-slate-600">권한 허용 후 시작/중지 버튼으로 음성을 녹음하세요.</p>
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
    </section>
  );
}
