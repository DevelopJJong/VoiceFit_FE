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
