import type { PlatformLinks, Recommendation, RecommendationFilter } from '../types';

export function buildPlatformLinks(recommendation: Recommendation): PlatformLinks {
  if (recommendation.platform_urls) return recommendation.platform_urls;

  const query = encodeURIComponent(`${recommendation.title} ${recommendation.artist}`);
  return {
    youtube: `https://www.youtube.com/results?search_query=${query}`,
    melon: `https://www.melon.com/search/total/index.htm?q=${query}`,
    spotify: `https://open.spotify.com/search/${query}`,
  };
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
