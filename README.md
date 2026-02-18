# VoiceFit Frontend

VoiceFit은 사용자의 음성(녹음 또는 업로드)을 분석 API에 전달하고,
Voice Profile과 추천 리스트를 보여주는 웹 프론트엔드입니다.

## Tech Stack

- Vite + React + TypeScript
- TailwindCSS
- State: React `useState`
- API: `fetch` + `multipart/form-data`

## Features

- 마이크 권한 요청 후 녹음 시작/중지 (MediaRecorder)
- 오디오 파일 업로드 fallback (`input type="file"`)
- 분석 요청
  - `POST {VITE_API_BASE_URL}/analyze`
  - form field: `file`
- 결과 표시
  - Voice Profile 막대그래프(밝음/허스키/부드러움)
  - Confidence 표시
  - 추천 카드 Top 5 (커버 이미지/외부 링크/이유 2개)
- 상태 처리
  - 로딩 UI
  - 오류 UI(권한 거부/무음)
  - API 실패 또는 `mockMode=true` 시 자동 Mock fallback

## Project Structure

- `src/pages/Home.tsx`
- `src/components/Recorder.tsx`
- `src/components/FileUploader.tsx`
- `src/components/ProfileBars.tsx`
- `src/components/Recommendations.tsx`
- `src/api/client.ts`
- `src/types.ts`

## Environment

`.env`

```bash
VITE_API_BASE_URL=http://localhost:8000
VITE_MOCK_MODE=false
```

- `VITE_MOCK_MODE=true`면 API 호출 없이 mock JSON으로 렌더링합니다.
- URL 쿼리 `?mockMode=true`도 동일하게 동작합니다.

## Run

```bash
npm install
npm run dev
```

개발 서버: `http://localhost:5173`

## Build

```bash
npm run build
npm run preview
```
