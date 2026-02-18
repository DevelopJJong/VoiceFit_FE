import type { AnalyzeResponse } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';
const ENV_MOCK_MODE = (import.meta.env.VITE_MOCK_MODE ?? 'false').toLowerCase() === 'true';

type AnalyzeVoiceResult = {
  data: AnalyzeResponse;
  usedMock: boolean;
  fallbackReason?: string;
};

const mockAnalyzeResponse: AnalyzeResponse = {
  profile: {
    brightness: 0.72,
    husky: 0.28,
    softness: 0.61,
  },
  summary: '맑고 비교적 밝은 톤이며, 발성이 부드러운 편입니다.',
  confidence: 0.84,
  input_info: {
    duration_sec: 12.4,
    signal_quality: 'good',
    note: '고음 구간 데이터가 적어 음역 추정은 보수적으로 적용했습니다.',
  },
  filters: {
    vocal_range_mode: 'male',
    allow_cross_gender: false,
  },
  recommendations: [
    {
      rank: 1,
      title: '밤편지',
      artist: 'IU',
      score: 0.89,
      match_percent: 89,
      reasons: ['밝은 톤과 잘 어울리는 발라드', '부드러운 발성에 적합'],
      tags: ['bright', 'soft', 'ballad', 'easy'],
      difficulty: 2,
      range_level: 2,
      external_url: 'https://example.com/track1',
      cover_url: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=400&fit=crop',
    },
    {
      rank: 2,
      title: '사랑은 늘 도망가',
      artist: 'Lim Young Woong',
      score: 0.86,
      match_percent: 86,
      reasons: ['밝고 선명한 고역이 자연스럽게 어울림', '감성 발라드 톤 매칭'],
      tags: ['bright', 'ballad', 'emotional'],
      difficulty: 2,
      range_level: 2,
      external_url: 'https://example.com/track2',
      cover_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=400&fit=crop',
    },
    {
      rank: 3,
      title: '좋니',
      artist: 'Yoon Jong Shin',
      score: 0.84,
      match_percent: 84,
      reasons: ['중고음 중심의 보컬 라인과 유사', '부드러운 톤에서 감정 전달이 잘 됨'],
      tags: ['mid-high', 'soft', 'ballad'],
      difficulty: 3,
      range_level: 3,
      external_url: 'https://example.com/track3',
      cover_url: 'https://images.unsplash.com/photo-1521334726092-b509a19597c1?w=400&h=400&fit=crop',
    },
    {
      rank: 4,
      title: 'Dynamite',
      artist: 'BTS',
      score: 0.82,
      match_percent: 82,
      reasons: ['밝은 톤이 팝 스타일에 잘 어울림', '리듬감 있는 발성에 적합'],
      tags: ['pop', 'bright', 'rhythm'],
      difficulty: 2,
      range_level: 2,
      external_url: 'https://example.com/track4',
      cover_url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=400&h=400&fit=crop',
    },
    {
      rank: 5,
      title: '고백',
      artist: 'Jung Joon Il',
      score: 0.79,
      match_percent: 79,
      reasons: ['부드러운 톤과 잔잔한 편곡이 잘 맞음', '무리한 고음 없이 안정적인 구성'],
      tags: ['soft', 'calm', 'ballad'],
      difficulty: 2,
      range_level: 2,
      external_url: 'https://example.com/track5',
      cover_url: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=400&h=400&fit=crop',
    },
  ],
};

function isQueryMockModeEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  const value = new URLSearchParams(window.location.search).get('mockMode');
  return value === 'true';
}

export async function analyzeVoice(file: Blob | File): Promise<AnalyzeVoiceResult> {
  if (ENV_MOCK_MODE || isQueryMockModeEnabled()) {
    return {
      data: mockAnalyzeResponse,
      usedMock: true,
      fallbackReason: 'mockMode=true',
    };
  }

  const formData = new FormData();
  const uploadFile =
    file instanceof File ? file : new File([file], 'recording.webm', { type: file.type || 'audio/webm' });

  formData.append('file', uploadFile);

  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let message = `Server error: ${response.status}`;
      try {
        const data = (await response.json()) as { detail?: string; message?: string };
        message = data.detail || data.message || message;
      } catch {
        // Keep default message when response body is not JSON.
      }
      return { data: mockAnalyzeResponse, usedMock: true, fallbackReason: message };
    }

    return { data: (await response.json()) as AnalyzeResponse, usedMock: false };
  } catch (error) {
    const message = error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.';
    return { data: mockAnalyzeResponse, usedMock: true, fallbackReason: message };
  }
}
