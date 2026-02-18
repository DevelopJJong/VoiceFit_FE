import type { AnalysisRecord, CreditEvent, PrecisionEvent } from '../types';

type MyPageProps = {
  userLabel: string;
  credits: number;
  creditEvents: CreditEvent[];
  precisionEvents: PrecisionEvent[];
  recentRecords: AnalysisRecord[];
  onAddCredits: (amount: number) => void;
  onBack: () => void;
  onLoadRecord: (record: AnalysisRecord) => void;
};

function formatDate(value: string): string {
  const date = new Date(value);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

export default function MyPage({
  userLabel,
  credits,
  creditEvents,
  precisionEvents,
  recentRecords,
  onAddCredits,
  onBack,
  onLoadRecord,
}: MyPageProps) {
  return (
    <section className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">마이페이지</h2>
            <p className="mt-1 text-sm text-slate-600">{userLabel} 계정</p>
          </div>
          <button type="button" onClick={onBack} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
            이전으로
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">크레딧 관리</h2>
        <p className="mt-1 text-sm text-slate-700">보유 크레딧: {credits}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button type="button" onClick={() => onAddCredits(3)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">+3 충전</button>
          <button type="button" onClick={() => onAddCredits(10)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700">+10 충전</button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">크레딧 내역</h2>
        <div className="mt-3 space-y-2 text-sm">
          {creditEvents.length === 0 ? <p className="text-slate-500">내역이 없습니다.</p> : null}
          {creditEvents.slice(0, 8).map((event) => (
            <div key={event.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
              <span className="text-slate-700">{event.note}</span>
              <span className="font-semibold text-slate-900">{event.type === 'charge' ? '+' : '-'}{event.amount}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">정밀 분석 사용 내역</h2>
        <div className="mt-3 space-y-2 text-sm">
          {precisionEvents.length === 0 ? <p className="text-slate-500">내역이 없습니다.</p> : null}
          {precisionEvents.slice(0, 8).map((event) => (
            <div key={event.id} className="rounded-lg bg-slate-50 px-3 py-2 text-slate-700">
              <p>{event.plan.toUpperCase()} 플랜 · {event.status}</p>
              <p className="text-xs text-slate-500">{formatDate(event.created_at)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">최근 상위 추천곡</h2>
        <div className="mt-3 space-y-2 text-sm">
          {recentRecords.length === 0 ? <p className="text-slate-500">분석 기록이 없습니다.</p> : null}
          {recentRecords.slice(0, 5).map((record) => {
            const top = record.result.recommendations[0];
            return (
              <button key={record.id} type="button" onClick={() => onLoadRecord(record)} className="flex w-full items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-left hover:bg-slate-100">
                <span className="text-slate-700">{top ? `${top.title} - ${top.artist}` : '추천 없음'}</span>
                <span className="text-xs text-slate-500">{formatDate(record.created_at)}</span>
              </button>
            );
          })}
        </div>
      </section>
    </section>
  );
}
