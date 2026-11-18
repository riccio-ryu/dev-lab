# React Streaming SSR (fastify + react-dom/server)

> 📅 YYYY-MM-DD · 🏷️ React 18, Streaming SSR, renderToPipeableStream, Suspense, fastify, Vite SSR

## 🎯 목적 / 질문
- Next.js 없이 `react-dom/server`만으로 Streaming SSR을 만들면 무엇을 직접 해야 하나?
- `onShellReady`와 `onAllReady`는 응답이 언제 시작되는지 어떻게 다르게 만드나?
- Suspense 경계를 어디에 두느냐에 따라 첫 화면(TTFB·FCP)이 어떻게 달라지나?
- 하이드레이션(`hydrateRoot`)과 selective hydration은 실제로 어떤 순서로 일어나나?
- shell 렌더링이 실패하면 어떻게 CSR로 폴백하나?

> 당근 모임팀 기술 스택: **fastify와 react-dom/server 기반의 Streaming SSR.** 공고 필수 요건 「React를 활용하는 SSR 웹 서비스 개발 경험」과 직결된다.

## 🛠️ 환경
- Node 20.x / React 18 / fastify / Vite (SSR 미들웨어 모드) / TypeScript

## 📁 구성 (예정)

| 파일 | 담을 것 |
|---|---|
| `server.ts` | fastify 서버, 개발은 Vite `middlewareMode`, 프로덕션은 빌드 산출물 사용 |
| `src/entry-server.tsx` | `renderToPipeableStream`으로 앱 렌더링 |
| `src/entry-client.tsx` | `hydrateRoot` |
| `src/App.tsx` | 빠른 영역 + 느린 영역(Suspense로 감싼 1~3초 지연 데이터) |

## ▶️ 실행 방법
```bash
npm install
npm run dev     # http://localhost:5173 (예정)
npm run build && npm start
curl -N http://localhost:5173/   # -N: 버퍼 없이 스트림이 조각으로 오는 것 확인
```

## 🧭 단계 (Claude가 뼈대·지연 데이터 준비 · ✍️는 직접)
1. `renderToString`으로 먼저 만들고 느린 데이터 때문에 **응답 전체가 늦는 것** 확인 ✍️
2. `renderToPipeableStream` + `onShellReady`로 바꾸고 `curl -N`으로 **HTML이 조각으로 오는 것** 확인 ✍️
3. `onAllReady`로 바꿨을 때 응답 시작 시점 비교 (크롤러용) ✍️
4. Suspense 경계를 1개 → 2개로 나눠 TTFB·FCP 변화 기록 ✍️
5. 느린 영역의 HTML이 `<template>`과 인라인 스크립트로 교체되는 모습을 응답 원문에서 확인 ✍️
6. 하이드레이션 전에 느린 영역 버튼을 눌러 **selective hydration** 확인 ✍️
7. shell에서 일부러 에러를 던져 `onShellError` → CSR 폴백 HTML 동작 확인 ✍️
8. (선택) 같은 화면을 Next.js App Router(`loading.tsx`)로 만들어 비교 ✍️

## 🔬 해본 것 ✍️
1.

## ✅ 결과 & 배운 점 ✍️
-

## 🎤 면접 연결
- 당근 대비 ① Q6 · ③-2 #2~#7
- 「Streaming SSR 서버 운영 경험 없음」을 「개인 실험으로 직접 붙여 봤다」로 바꾸는 실험

## 🔗 참고 링크
- https://react.dev/reference/react-dom/server/renderToPipeableStream
- https://react.dev/reference/react/Suspense
- https://react.dev/reference/react-dom/client/hydrateRoot
- https://vite.dev/guide/ssr.html
- https://fastify.dev/docs/latest/Reference/Reply/
