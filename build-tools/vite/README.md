# Vite

> 📅 YYYY-MM-DD · 🏷️ Vite, ESM, HMR, esbuild, Rollup, SSR 미들웨어 모드

## 🎯 목적 / 질문
- Vite 개발 서버는 왜 빠른가? 번들을 안 만든다는 게 실제로 어떤 모습인가?
- 의존성 사전 번들(esbuild)과 내 소스 코드 변환은 어떻게 다르게 처리되나?
- 프로덕션 빌드는 무엇으로 하나? 해시가 붙은 파일 이름은 언제 바뀌나?
- SSR에서는 Vite를 어떻게 서버(fastify)에 붙이나? (`middlewareMode`, `ssrLoadModule`)

> 당근 모임팀 스택(Vite + fastify Streaming SSR)을 이해하기 위한 첫 실험. 다음 실험 `frontend/react-streaming-ssr-fastify`의 바탕이 된다.

## 🛠️ 환경
- Node 20.x / Vite (최신) / React 18 / TypeScript

## ▶️ 실행 방법
```bash
npm create vite@latest . -- --template react-ts
npm install
npm run dev
npm run build && npm run preview
```

## 🧭 단계 (Claude가 준비 · ✍️는 직접)
1. `npm run dev` 후 개발자 도구 Network 탭에서 **모듈이 파일별로 따로 요청되는 것** 확인 ✍️
2. `node_modules/.vite/deps` 안을 열어 의존성이 미리 묶인 결과 확인 ✍️
3. 컴포넌트 하나를 고쳐 **HMR로 그 모듈만 바뀌는 것** 확인 (상태가 유지되는지) ✍️
4. `npm run build` 결과 `dist/assets`의 해시 파일명 기록 → 한 파일만 고치고 다시 빌드 → **어떤 파일 이름만 바뀌는지** 비교 ✍️ (면접 단골: 캐시 버스팅)
5. 같은 화면을 `frontend/next-10-to-14`의 빌드 시간과 비교해 숫자로 남기기 ✍️

## 🔬 해본 것 ✍️
1.

## ✅ 결과 & 배운 점 ✍️
-

## 🎤 면접 연결
- 당근 대비 ③-2 #9 Vite는 왜 빠른가 · #10 번들 해시 · #11 청크 로드 에러
- ③-1 #15 ESM vs CommonJS

## 🔗 참고 링크
- https://vite.dev/guide/why.html
- https://vite.dev/guide/dep-pre-bundling.html
- https://vite.dev/guide/ssr.html
