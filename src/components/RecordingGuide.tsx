type RecordingGuideProps = {
  errorMessage: string | null;
};

function getGuide(errorMessage: string | null): string {
  if (!errorMessage) return '조용한 공간에서 입과 마이크 거리를 10~15cm로 유지하고 또렷하게 5~10초 말해보세요.';
  if (errorMessage.includes('무음')) return '주변 소음을 줄이고 마이크 가까이에서 평소 대화 톤으로 다시 녹음해보세요.';
  if (errorMessage.includes('길이')) return '최소 3초 이상, 가급적 6초 이상 녹음하면 분석 안정성이 높아집니다.';
  if (errorMessage.includes('wav')) return '녹음 또는 업로드 파일을 WAV로 준비해 주세요. 다른 형식은 분석이 제한될 수 있습니다.';
  return '입력 파일 상태를 확인한 뒤 다시 시도해 주세요. 필요하면 새로 녹음하는 것이 가장 빠릅니다.';
}

export default function RecordingGuide({ errorMessage }: RecordingGuideProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">재녹음 가이드</h2>
      <p className="mt-2 text-sm text-slate-700">{getGuide(errorMessage)}</p>
    </section>
  );
}
