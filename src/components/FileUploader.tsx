import type { ChangeEvent } from 'react';

type FileUploaderProps = {
  onSelectFile: (file: File) => void;
};

export default function FileUploader({ onSelectFile }: FileUploaderProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">파일 업로드</h2>
      <p className="mt-1 text-sm text-slate-600">녹음이 어렵다면 오디오 파일을 직접 업로드하세요.</p>
      <input
        type="file"
        accept="audio/wav"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          const file = event.target.files?.[0];
          if (!file) return;
          onSelectFile(file);
        }}
        className="mt-4 block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700"
      />
    </section>
  );
}
