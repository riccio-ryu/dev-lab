# Next 10 → 14 버전업

> 📅 2026-10-26 · 🏷️ Next.js, React 18, 버전업, App Router, styled-components

## 🎯 목적 / 질문
- Next 10 프로젝트를 14로 올릴 때 실제로 어디서 깨지는가?
- Node, React, TypeScript를 함께 올리는 순서는?
- 1단계: Pages Router를 유지한 채 14까지 올리기
- 2단계: Pages Router에서 App Router로 옮기기

## 🛠️ 환경

| | 출발 | 도착 |
|---|---|---|
| Node | 16.14.2 | 20.x (18.17 이상) |
| Next | 10.2.3 | 14.x |
| React | 17.0.2 | 18.x |
| TypeScript | 4.3.5 | 5.x |
| styled-components | 5.3.11 | |

## 📁 구성

| 파일 | 담고 있는 것 | 버전업 포인트 |
|---|---|---|
| `pages/index.tsx` | SSG, `next/image`, `<Link><a>` | Link, Image |
| `pages/posts/[id].tsx` | ISR (`fallback: true`, `revalidate`, `notFound`) | fallback 동작 |
| `pages/ssr.tsx` | SSR + `redirect` | |
| `pages/client.tsx` | CSR, `useEffect` fetch, `dynamic(ssr: false)` | StrictMode |
| `pages/gallery.tsx` | `next/image`의 `layout` 3종 | Image |
| `pages/_document.tsx` | styled-components SSR, 구글 폰트 `<link>` | SWC, next/font, App Router |
| `components/Layout.tsx` | `React.FC` children, `passHref` + styled `a` | @types/react 18, Link |
| `components/RenderedAt.tsx` | 서버/클라이언트 결과가 다른 렌더링 | 하이드레이션 |
| `next.config.js` | `images.domains`, `redirects`, webpack 4 설정 | webpack 5 |
| `.babelrc` | styled-components babel 플러그인 | SWC |
| `scripts/smoke.mjs` | 버전업 전후 동작 비교 테스트 (12개) | |
| `baseline/` | Next 10 빌드 출력과 smoke 결과 | |

👉 버전별 주의사항: [UPGRADE_NOTES.md](./UPGRADE_NOTES.md)

## ▶️ 실행 방법
```bash
nvm use
npm install
npm run dev            # http://localhost:3010

npm run build && npm start
npm run smoke          # 다른 터미널에서 실행
npm run baseline       # 빌드 출력을 baseline/에 저장
```

## 🔬 해본 것 ✍️
1.

## ✅ 결과 & 배운 점 ✍️
-

## 🔗 참고 링크
- [Next.js 버전업 가이드 (14)](https://nextjs.org/docs/pages/guides/upgrading/version-14)
- [Codemods](https://nextjs.org/docs/app/guides/upgrading/codemods)
- [App Router 마이그레이션](https://nextjs.org/docs/app/guides/migrating/app-router-migration)
