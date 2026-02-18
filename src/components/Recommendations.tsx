import type { Recommendation } from '../types';

type RecommendationsProps = {
  recommendations: Recommendation[];
};

export default function Recommendations({ recommendations }: RecommendationsProps) {
  const top5 = [...recommendations]
    .sort((a, b) => a.rank - b.rank)
    .slice(0, 5);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">추천 리스트 Top 5</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {top5.map((item, index) => (
          <article key={`${item.rank}-${item.title}-${index}`} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            {item.cover_url ? (
              <img src={item.cover_url} alt={`${item.title} cover`} className="h-36 w-full object-cover" loading="lazy" />
            ) : null}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-cyan-700">#{item.rank}</p>
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.artist}</p>
                </div>
                <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-semibold text-white">
                  {item.match_percent}%
                </span>
              </div>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {item.reasons.slice(0, 2).map((reasonText, reasonIdx) => (
                  <li key={`${reasonText}-${reasonIdx}`}>{reasonText}</li>
                ))}
              </ul>
              {item.external_url ? (
                <a
                  href={item.external_url}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block text-sm font-medium text-cyan-700 hover:text-cyan-800"
                >
                  외부 링크 열기
                </a>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
