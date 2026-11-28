# 🗺️ 로드맵

앞으로 공부할 주제와 진행 상태입니다. 끝난 실험의 결과는 각 폴더의 README와 [실험 목록](./README.md#-실험-목록)에 있습니다.

## 🧭 고르는 기준

무엇을 먼저 할지는 위에서부터 봅니다.

1. **날짜가 정해져 있나?** 날짜가 가까운 주제를 먼저 한다.
2. **자주 요구되는데 아직 해 본 적이 없나?** 한 번 해 두면 여러 곳에 쓰인다.
3. **설명하다 막힌 적이 있나?** 다시 물어볼 가능성이 높다.
4. **이미 만든 것 위에 쌓을 수 있나?** 비슷하면 빨리 끝나는 쪽을 먼저 한다.

새 폴더를 만들지, 기존 실험을 넓힐지

- 기존 코드가 없으면 못 하는 질문이면 기존 실험을 넓힌다. (예: 여러 상품 카드는 `QuantitySelector`가 있어야 했다)
- 기존 코드와 상관없이 할 수 있으면 새 폴더를 만든다.

실험까지 할지, 공부만 할지

- 직접 해 봤다고 말할 수 있어야 하면 실험까지 한다. 숫자를 재거나, 일부러 버그를 넣어 확인한다.
- 개념만 설명할 수 있으면 되는 주제는 작은 예제와 README 정리로 끝낸다.

## 🚧 진행 중

없음

## ⬜ 다음

순서대로 진행합니다.

| # | 주제 | 핵심 질문 | 폴더 | 방식 | 예정 |
| --- | --- | --- | --- | --- | --- |
| 1 | ts-pattern · es-toolkit | 분기를 빠뜨리면 컴파일 에러가 나게 하려면? es-toolkit은 lodash와 무엇이 다른가? | `frontend/ts-pattern-es-toolkit` | 공부 | 12-01 |
| 2 | A/B 테스트 | 사용자를 어떻게 나누고, 새로고침해도 같은 그룹에 두나? 결과는 언제 믿을 수 있나? | `frontend/ab-test` | 실험 | 12-02 |
| 3 | ESLint 룰 | ESLint·Biome·Oxlint·Prettier는 각각 무엇을 하나? 팀 규칙을 커스텀 룰로 강제하려면? | `build-tools/eslint-rules` | 공부 + 실험 | 12-03 |
| 4 | 웹 접근성 (KWCAG) | 레이블·포커스·대체 텍스트·명도 대비를 axe와 Lighthouse로 검사하고 고치면? 스크린 리더로는 어떻게 들리나? | `frontend/a11y-kwcag` | 실험 | |
| 5 | Lighthouse 성능 | LCP·CLS·INP는 무엇이고, 측정할 때마다 점수가 흔들리는 이유는? LCP 요소는 어떻게 줄이나? | `frontend/a11y-kwcag` 안에 정리 | 공부 + 실험 | |
| 6 | E2E 테스트 (Playwright) | 실제 브라우저에서 사용자 흐름을 확인하려면? 접근성 검사(axe)도 CI에 넣을 수 있나? | 미정 | 실험 | |
| 7 | 전역 상태 (Zustand · Jotai) | 여러 컴포넌트가 같이 쓰는 상태는 어디에 두나? 두 라이브러리는 무엇이 다른가? | 미정 | 실험 | |

## 💤 나중에

순서는 아직 정하지 않았습니다.

| 주제 | 핵심 질문 |
| --- | --- |
| 렌더링 전략 | 같은 페이지를 SSG·ISR·SSR·CSR로 만들면 빌드 결과와 응답 시점이 어떻게 다른가? |
| 이벤트 루프 | 마이크로태스크와 매크로태스크는 어떤 순서로 실행되나? |
| 배포 후 청크 로드 에러 · 캐시 버스팅 | 옛 HTML이 지워진 청크를 요청하면 무슨 일이 생기고, 어떻게 복구하나? 해시 파일명은 언제 바뀌나? |
| 서버 상태 vs 클라이언트 상태 (TanStack Query) | 서버에서 온 데이터와 화면 상태를 왜 나누나? staleTime·gcTime은 무엇인가? |
| 제어 vs 비제어 컴포넌트 | 같은 폼을 두 방식으로 만들면 렌더 횟수가 어떻게 다른가? |
| Next.js 보안 | middleware 인증 우회(CVE-2025-29927), 서버 환경 변수가 번들로 새는 경우, SSRF |
| Babel | 최소 설정으로 무엇이 바뀌나? 플러그인을 직접 만들면? |
| Vite | 개발 서버는 왜 빠른가? SSR 미들웨어 모드는? |
| React Streaming SSR (fastify) | `renderToPipeableStream`, Suspense 경계, selective hydration |
| vanilla-extract | zero-runtime CSS는 styled-components와 무엇이 다른가? |
| 차트 라이브러리 어댑터 | 라이브러리를 바꿔도 화면 코드는 그대로 두려면? |
| 웹뷰 ↔ 네이티브 브릿지 | `postMessage`로 메시지 규약을 어떻게 설계하나? |
| BFF (Node.js) | 여러 API 응답을 화면에 맞게 묶는 얇은 서버를 만들면? |
| Vue + React 한 모노레포 | `apps/vue-shop`을 붙여 `@lab/utils`만 같이 쓰면? (`pnpm-turborepo-vitest` 확장) |

## ✅ 끝남

| 끝난 날 | 주제 | 폴더 |
| --- | --- | --- |
| 2026-11-29 | Storybook (ui 패키지 stories, play 함수) | [build-tools/pnpm-turborepo-vitest](./build-tools/pnpm-turborepo-vitest) |
| 2026-11-28 | Jest (Vitest 테스트 옮기기, mock) | [frontend/jest](./frontend/jest) |
| 2026-11-23 | 모노레포 + 단위·컴포넌트 테스트 + CI 품질 게이트 | [build-tools/pnpm-turborepo-vitest](./build-tools/pnpm-turborepo-vitest) |
| 2026-11-19 | Next 10 → 14 버전업 | [frontend/next-10-to-14](./frontend/next-10-to-14) |
