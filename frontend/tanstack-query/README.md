# TanStack Query

> 📅 YYYY-MM-DD · 🏷️ TanStack Query v5, 서버 상태, 캐시, 낙관적 업데이트, SSR hydration

## 🎯 목적 / 질문
- 서버 상태와 클라이언트 상태를 나누면 코드가 실제로 어떻게 달라지나? (같은 화면을 useState+useEffect로, TanStack Query로 각각 만들어 비교)
- `staleTime`과 `gcTime`은 언제 다시 요청하고 언제 캐시를 버리게 만드나?
- 낙관적 업데이트에서 실패하면 어떻게 되돌리나?
- 무한 스크롤(`useInfiniteQuery`)은 어떻게 동작하나?
- SSR에서 `dehydrate` → `HydrationBoundary`로 넘기지 않으면 무슨 일이 생기나?

> 당근 모임팀 기술 스택. 인계 문서 4장의 12번 「서버 상태 vs 클라이언트 상태」(대성산업 면접에서 잘못 답한 질문)를 이 실험에 흡수한다.

## 🛠️ 환경
- Node 20.x / React 18 / Vite / TanStack Query v5 / TypeScript
- 가짜 API: 지연·실패를 조절할 수 있는 mock (예: 모임 목록·참여 API)

## ▶️ 실행 방법
```bash
npm install
npm run dev
```

## 🧭 단계 (Claude가 mock API·뼈대 준비 · ✍️는 직접)
1. 「모임 목록」을 useState+useEffect로 만들고 로딩·에러·중복 요청·탭 복귀 처리 코드를 세어 보기 ✍️
2. 같은 화면을 `useQuery`로 바꾸고 줄어든 코드와 자동으로 생긴 동작 기록 ✍️
3. `staleTime` 0 / 30초 / Infinity를 바꿔 가며 Devtools로 재요청 시점 확인 ✍️
4. 다른 화면으로 갔다 돌아올 때 `gcTime`에 따라 캐시가 남는지 확인 ✍️
5. 「모임 참여」 버튼에 낙관적 업데이트 구현 → mock이 실패하도록 해서 롤백 확인 ✍️
6. `useInfiniteQuery` + IntersectionObserver로 무한 스크롤 ✍️
7. (스트리밍 SSR 실험과 연결) 서버에서 prefetch → dehydrate → 클라이언트 hydration, 빼먹었을 때 요청이 한 번 더 나가는 것 확인 ✍️

## 🔬 해본 것 ✍️
1.

## ✅ 결과 & 배운 점 ✍️
-

## 🎤 면접 연결
- 당근 대비 ① Q9 · ③-2 #8, #13~#16
- 대성산업에서 「민감도 기준」으로 잘못 답한 질문을 「원본이 어디 있나」로 답할 근거

## 🔗 참고 링크
- https://tanstack.com/query/latest/docs/framework/react/overview
- https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults
- https://tanstack.com/query/latest/docs/framework/react/guides/optimistic-updates
- https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr
