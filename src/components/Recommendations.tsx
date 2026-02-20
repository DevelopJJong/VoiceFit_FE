import { useEffect, useMemo, useState } from 'react';
import { buildPlatformLinks, collectTagGroups, filterRecommendations, findFallbackCoverUrl } from '../services/recommendations';
import type { Recommendation, RecommendationFilter } from '../types';

type RecommendationsProps = {
  recommendations: Recommendation[];
};

const DEFAULT_FILTER: RecommendationFilter = {
  genreTag: 'all',
  moodTag: 'all',
  difficulty: 'all',
  rangeLevel: 'all',
};

function normalizeCoverUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('//')) return `https:${url}`;
  if (url.startsWith('http://')) return `https://${url.slice('http://'.length)}`;
  return url;
}

export default function Recommendations({ recommendations }: RecommendationsProps) {
  const [filter, setFilter] = useState<RecommendationFilter>(DEFAULT_FILTER);
  const [animatedScores, setAnimatedScores] = useState<Record<string, number>>({});
  const [fallbackCovers, setFallbackCovers] = useState<Record<string, string>>({});

  const { genreTags, moodTags } = useMemo(() => collectTagGroups(recommendations), [recommendations]);
  const filtered = useMemo(() => filterRecommendations(recommendations, filter), [recommendations, filter]);
  const top5 = useMemo(
    () =>
      [...filtered]
        .sort((a, b) => a.rank - b.rank)
        .slice(0, 5),
    [filtered],
  );

  useEffect(() => {
    const zeroState = top5.reduce<Record<string, number>>((acc, item, index) => {
      acc[`${item.rank}-${item.title}-${index}`] = 0;
      return acc;
    }, {});
    setAnimatedScores(zeroState);

    const timer = window.setTimeout(() => {
      const next = top5.reduce<Record<string, number>>((acc, item, index) => {
        acc[`${item.rank}-${item.title}-${index}`] = Math.max(0, Math.min(100, item.match_percent));
        return acc;
      }, {});
      setAnimatedScores(next);
    }, 80);

    return () => window.clearTimeout(timer);
  }, [filtered]);

  useEffect(() => {
    let isCancelled = false;

    const loadFallbackCovers = async () => {
      const results = await Promise.all(
        top5.map(async (item, index) => {
          const cardKey = `${item.rank}-${item.title}-${index}`;
          const baseCover = normalizeCoverUrl(item.cover_url);
          if (baseCover) return [cardKey, baseCover] as const;

          const fallback = await findFallbackCoverUrl(item.title, item.artist);
          return fallback ? ([cardKey, fallback] as const) : undefined;
        }),
      );

      if (isCancelled) return;

      const next: Record<string, string> = {};
      results.forEach((entry) => {
        if (!entry) return;
        next[entry[0]] = entry[1];
      });
      setFallbackCovers(next);
    };

    void loadFallbackCovers();

    return () => {
      isCancelled = true;
    };
  }, [top5]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">추천 리스트 Top 5</h2>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <select
          value={filter.genreTag}
          onChange={(event) => setFilter((prev) => ({ ...prev, genreTag: event.target.value }))}
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
        >
          <option value="all">장르 전체</option>
          {genreTags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
        <select
          value={filter.moodTag}
          onChange={(event) => setFilter((prev) => ({ ...prev, moodTag: event.target.value }))}
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
        >
          <option value="all">분위기 전체</option>
          {moodTags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
        <select
          value={filter.difficulty}
          onChange={(event) => setFilter((prev) => ({ ...prev, difficulty: event.target.value as RecommendationFilter['difficulty'] }))}
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
        >
          <option value="all">난이도 전체</option>
          <option value="1">난이도 1</option>
          <option value="2">난이도 2</option>
          <option value="3">난이도 3</option>
          <option value="4">난이도 4</option>
          <option value="5">난이도 5</option>
        </select>
        <select
          value={filter.rangeLevel}
          onChange={(event) => setFilter((prev) => ({ ...prev, rangeLevel: event.target.value as RecommendationFilter['rangeLevel'] }))}
          className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs"
        >
          <option value="all">음역 전체</option>
          <option value="1">음역 1</option>
          <option value="2">음역 2</option>
          <option value="3">음역 3</option>
          <option value="4">음역 4</option>
          <option value="5">음역 5</option>
        </select>
      </div>

      <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {top5.map((item, index) => {
          const cardKey = `${item.rank}-${item.title}-${index}`;
          const animatedScore = animatedScores[cardKey] ?? 0;
          const links = buildPlatformLinks(item);
          const coverUrl = fallbackCovers[cardKey];
          const reasonsToRender = item.reasons.length > 0 ? item.reasons.slice(0, 2) : ['추천 이유 준비 중'];
          const aiBadgeLabel = item.ai_generated === true ? 'AI 분석 이유' : item.ai_generated === false ? '기본 추천 이유' : null;

          return (
            <article key={cardKey} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              {coverUrl ? (
                <div className="flex h-64 w-full items-center justify-center bg-slate-100">
                  <img
                    src={coverUrl}
                    alt={`${item.title} cover`}
                    className="h-full w-full object-contain"
                    loading="lazy"
                  />
                </div>
              ) : null}
              <div className="p-5">
                <div className="flex items-start gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="inline-flex items-center rounded-full bg-cyan-700 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
                        추천 #{item.rank}
                      </p>
                      {aiBadgeLabel ? (
                        <span className="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-[11px] font-semibold text-cyan-700">
                          {aiBadgeLabel}
                        </span>
                      ) : null}
                    </div>
                    <h3 className="mt-2 text-base font-semibold text-slate-900">{item.title}</h3>
                    <p className="text-sm text-slate-600">{item.artist}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="mb-1 flex items-center justify-between text-xs font-medium text-slate-600">
                    <span>매칭 점수</span>
                    <span>{item.match_percent}%</span>
                  </div>
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full bg-cyan-600 transition-all duration-1000 ease-out"
                      style={{ width: `${animatedScore}%` }}
                    />
                  </div>
                </div>
                <div className="mt-3 rounded-xl border border-cyan-100 bg-cyan-50/60 p-3">
                  <p className="text-xs font-semibold text-cyan-800">추천 이유</p>
                  <ul className="mt-2 space-y-2 text-sm text-slate-800">
                    {reasonsToRender.map((reasonText, reasonIdx) => (
                      <li key={`${reasonText}-${reasonIdx}`} className="rounded-lg bg-white/90 px-2.5 py-2 leading-5 shadow-sm ring-1 ring-cyan-100">
                        {reasonText}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <a href={links.youtube} target="_blank" rel="noreferrer" className="text-xs font-semibold text-cyan-700 hover:text-cyan-800">YouTube</a>
                  <a href={links.melon} target="_blank" rel="noreferrer" className="text-xs font-semibold text-cyan-700 hover:text-cyan-800">Melon</a>
                  <a href={links.spotify} target="_blank" rel="noreferrer" className="text-xs font-semibold text-cyan-700 hover:text-cyan-800">Spotify</a>
                  {item.external_url ? (
                    <a href={item.external_url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-cyan-700 hover:text-cyan-800">원본 링크</a>
                  ) : null}
                </div>

                <button
                  type="button"
                  disabled
                  className="mt-3 rounded-lg border border-slate-300 bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500"
                >
                  30초 미리듣기 (백엔드 연동 예정)
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
