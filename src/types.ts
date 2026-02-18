export type VoiceProfile = {
  brightness: number;
  husky: number;
  softness: number;
};

export type InputInfo = {
  duration_sec: number;
  signal_quality: string;
  note: string;
};

export type Filters = {
  vocal_range_mode: string;
  allow_cross_gender: boolean;
};

export type Recommendation = {
  rank: number;
  title: string;
  artist: string;
  score: number;
  match_percent: number;
  reasons: string[];
  tags: string[];
  difficulty: number;
  range_level: number;
  external_url?: string;
  cover_url?: string;
};

export type AnalyzeResponse = {
  profile: VoiceProfile;
  summary: string;
  confidence: number;
  input_info: InputInfo;
  filters: Filters;
  recommendations: Recommendation[];
};
