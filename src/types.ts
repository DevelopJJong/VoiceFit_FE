export type VocalRangeMode = 'male' | 'female' | 'any';
export type SignalQuality = 'good' | 'ok' | 'bad';

export type VoiceProfile = {
  brightness: number;
  husky: number;
  softness: number;
};

export type InputInfo = {
  duration_sec: number;
  signal_quality: SignalQuality;
  note: string;
};

export type Filters = {
  vocal_range_mode: VocalRangeMode;
  allow_cross_gender: boolean;
};

export type PlatformLinks = {
  youtube?: string;
  melon?: string;
  spotify?: string;
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
  preview_url?: string;
  platform_urls?: PlatformLinks;
};

export type AnalyzeResponse = {
  profile: VoiceProfile;
  summary: string;
  confidence: number;
  input_info: InputInfo;
  filters: Filters;
  recommendations: Recommendation[];
};

export type AnalyzeVoiceParams = {
  file: File;
  vocalRangeMode?: VocalRangeMode;
  allowCrossGender?: boolean;
  mock?: boolean;
};

export type ApiErrorEnvelope = {
  error?: {
    code?: string;
    message?: string;
    hint?: string;
  };
};

export type HealthResponse = {
  status?: string;
  message?: string;
};

export type LoginCredentials = {
  email: string;
  password: string;
};

export type SignupPayload = {
  name: string;
  email: string;
  password: string;
};

export type SocialProvider = 'google' | 'kakao' | 'naver';

export type AnalysisSource = 'api' | 'mock';

export type AnalysisRecord = {
  id: string;
  created_at: string;
  source: AnalysisSource;
  result: AnalyzeResponse;
};

export type CreditEvent = {
  id: string;
  created_at: string;
  type: 'charge' | 'use';
  amount: number;
  note: string;
};

export type PrecisionPlan = 'free' | 'plus' | 'pro';

export type PrecisionEvent = {
  id: string;
  created_at: string;
  plan: PrecisionPlan;
  used_credit: number;
  status: 'requested' | 'completed';
};

export type RecommendationFilter = {
  genreTag: string;
  moodTag: string;
  difficulty: 'all' | '1' | '2' | '3' | '4' | '5';
  rangeLevel: 'all' | '1' | '2' | '3' | '4' | '5';
};
