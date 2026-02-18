import type { AnalysisRecord } from '../types';

type AnalysisHistoryProps = {
  records: AnalysisRecord[];
  onLoadRecord: (record: AnalysisRecord) => void;
};

function formatDate(value: string): string {
  const date = new Date(value);
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

export default function AnalysisHistory({ records, onLoadRecord }: AnalysisHistoryProps) {
  if (records.length === 0) return null;

  const latest = records[0];
  const previous = records[1];

  return (
    <section className="space-y-4 rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">분석 히스토리</h2>
      <p className="text-sm text-slate-600">최근 결과를 다시 불러오고 이전 결과와 비교할 수 있습니다.</p>

      {previous ? (
        <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
          <p>최근 신뢰도: {Math.round(latest.result.confidence * 100)}%</p>
          <p>이전 신뢰도: {Math.round(previous.result.confidence * 100)}%</p>
          <p>
            밝음 변화: {Math.round((latest.result.profile.brightness - previous.result.profile.brightness) * 100)}%
          </p>
        </div>
      ) : null}

      <div className="space-y-2">
        {records.slice(0, 5).map((record) => (
          <button
            key={record.id}
            type="button"
            onClick={() => onLoadRecord(record)}
            className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left hover:bg-slate-50"
          >
            <div>
              <p className="text-sm font-semibold text-slate-800">{record.result.summary}</p>
              <p className="text-xs text-slate-500">{formatDate(record.created_at)}</p>
            </div>
            <span className="rounded-full bg-slate-900 px-2 py-1 text-xs font-semibold text-white">
              {record.source.toUpperCase()}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
