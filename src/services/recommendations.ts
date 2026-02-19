import type { PlatformLinks, Recommendation, RecommendationFilter } from '../types';

const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search';

export function buildPlatformLinks(recommendation: Recommendation): PlatformLinks {
  if (recommendation.platform_urls) return recommendation.platform_urls;

  const query = encodeURIComponent(`${recommendation.title} ${recommendation.artist}`);
  return {
    youtube: `https://www.youtube.com/results?search_query=${query}`,
    melon: `https://www.melon.com/search/total/index.htm?q=${query}`,
    spotify: `https://open.spotify.com/search/${query}`,
  };
}

export async function findFallbackCoverUrl(title: string, artist: string): Promise<string | undefined> {
  const term = encodeURIComponent(`${title} ${artist}`);

  try {
    const response = await fetch(`${ITUNES_SEARCH_URL}?term=${term}&entity=song&limit=1`);
    if (!response.ok) return undefined;

    const data = (await response.json()) as {
      results?: Array<{ artworkUrl100?: string; artworkUrl60?: string }>;
    };
    const artwork = data.results?.[0]?.artworkUrl100 ?? data.results?.[0]?.artworkUrl60;
    if (!artwork) return undefined;

    return artwork.replace(/\d+x\d+bb/, '512x512bb');
  } catch {
    return undefined;
  }
}

export function filterRecommendations(recommendations: Recommendation[], filter: RecommendationFilter): Recommendation[] {
  return recommendations.filter((item) => {
    const genreMatch = filter.genreTag === 'all' || item.tags.includes(filter.genreTag);
    const moodMatch = filter.moodTag === 'all' || item.tags.includes(filter.moodTag);
    const difficultyMatch = filter.difficulty === 'all' || item.difficulty === Number(filter.difficulty);
    const rangeMatch = filter.rangeLevel === 'all' || item.range_level === Number(filter.rangeLevel);
    return genreMatch && moodMatch && difficultyMatch && rangeMatch;
  });
}

export function collectTagGroups(recommendations: Recommendation[]): { genreTags: string[]; moodTags: string[] } {
  const allTags = new Set<string>();
  recommendations.forEach((item) => item.tags.forEach((tag) => allTags.add(tag)));

  const genreCandidates = ['ballad', 'pop', 'rock', 'rnb', 'hiphop', 'acoustic'];
  const moodCandidates = ['calm', 'emotional', 'bright', 'soft', 'rhythm', 'easy', 'mid-high'];

  const genreTags = [...allTags].filter((tag) => genreCandidates.includes(tag));
  const moodTags = [...allTags].filter((tag) => moodCandidates.includes(tag));

  return { genreTags, moodTags };
}
