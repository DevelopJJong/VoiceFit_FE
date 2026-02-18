import type { AnalyzeResponse, AnalyzeVoiceParams, ApiErrorEnvelope, HealthResponse } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://port-0-voicefit-be-mk17w6662a83f852.sel3.cloudtype.app';

export class VoicefitApiError extends Error {
  code?: string;
  hint?: string;
  status?: number;

  constructor(message: string, options?: { code?: string; hint?: string; status?: number }) {
    super(message);
    this.name = 'VoicefitApiError';
    this.code = options?.code;
    this.hint = options?.hint;
    this.status = options?.status;
  }
}

function toUserFriendlyErrorMessage(payload?: ApiErrorEnvelope, fallback?: string): string {
  const code = payload?.error?.code;
  const message = payload?.error?.message;
  const hint = payload?.error?.hint;

  if (!code && !message && !hint) {
    return fallback ?? '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }

  const baseByCode: Record<string, string> = {
    UNSUPPORTED_FORMAT: '지원하지 않는 파일 확장자입니다.',
    FILE_TOO_LARGE: '업로드 파일 용량이 제한을 초과했습니다.',
    EMPTY_FILE: '빈 파일은 업로드할 수 없습니다.',
    INVALID_WAV: 'WAV 헤더 또는 메타데이터가 올바르지 않습니다.',
    UNSUPPORTED_WAV_ENCODING: '지원하지 않는 WAV 샘플 포맷입니다.',
    AUDIO_DECODE_ERROR: '오디오 디코딩에 실패했습니다.',
    INVALID_AUDIO_SIGNAL: '오디오 신호값이 비정상입니다.',
    AUDIO_TOO_SHORT: '오디오 길이가 너무 짧습니다. 3초 이상으로 다시 시도해주세요.',
    SILENT_AUDIO: '거의 무음에 가까운 오디오입니다. 다시 녹음해주세요.',
    NON_VOCAL_INPUT: '음성으로 판단하기 어려운 입력입니다.',
    INVALID_BOOLEAN: '옵션 값 형식이 올바르지 않습니다.',
    INVALID_VOCAL_RANGE_MODE: '보컬 성별 옵션 값이 올바르지 않습니다.',
    INVALID_AUDIO: '오디오 파일 형식 또는 내용이 올바르지 않습니다.',
    EMPTY_AUDIO: '무음이거나 너무 짧은 오디오입니다. 3초 이상 녹음해 주세요.',
    UNSUPPORTED_MEDIA_TYPE: '지원하지 않는 오디오 형식입니다. 다른 파일 형식을 시도해 주세요.',
    ANALYSIS_FAILED: '음성 분석에 실패했습니다. 잠시 후 다시 시도해 주세요.',
  };

  const base = (code && baseByCode[code]) || message || fallback || '요청 처리 중 오류가 발생했습니다.';
  return hint ? `${base} (${hint})` : base;
}

async function parseError(response: Response): Promise<VoicefitApiError> {
  const fallbackMessage = `서버 오류(${response.status})가 발생했습니다.`;

  try {
    const json = (await response.json()) as ApiErrorEnvelope;
    return new VoicefitApiError(toUserFriendlyErrorMessage(json, fallbackMessage), {
      code: json.error?.code,
      hint: json.error?.hint,
      status: response.status,
    });
  } catch {
    return new VoicefitApiError(fallbackMessage, { status: response.status });
  }
}

export async function healthCheck(): Promise<HealthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) {
      throw await parseError(response);
    }
    return (await response.json()) as HealthResponse;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('헬스 체크에 실패했습니다.');
  }
}

export async function analyzeVoice({
  file,
  vocalRangeMode = 'any',
  allowCrossGender = false,
  mock = false,
}: AnalyzeVoiceParams): Promise<AnalyzeResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('vocal_range_mode', vocalRangeMode);
  formData.append('allow_cross_gender', String(allowCrossGender));
  formData.append('mock', String(mock));

  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw await parseError(response);
    }

    return (await response.json()) as AnalyzeResponse;
  } catch (error) {
    if (error instanceof Error) throw error;
    throw new Error('네트워크 오류로 분석 요청에 실패했습니다.');
  }
}
