# Next 10 → 14 버전업

> 📅 2026-10-26 · 🏷️ Next.js, React 18, 버전업, App Router, styled-components

## 🎯 목적 / 질문

- Next 10 프로젝트를 14로 올릴 때 실제로 어디서 깨지는가?
- Node, React, TypeScript를 함께 올리는 순서는?
- 1단계: Pages Router를 유지한 채 14까지 올리기
- 2단계: Pages Router에서 App Router로 옮기기

## 🛠️ 환경

|                   | 출발    | 도착              |
| ----------------- | ------- | ----------------- |
| Node              | 16.14.2 | 20.x (18.17 이상) |
| Next              | 10.2.3  | 14.x              |
| React             | 17.0.2  | 18.x              |
| TypeScript        | 4.3.5   | 5.x               |
| styled-components | 5.3.11  |                   |

## 📁 구성

### 도착: Next 14 + App Router

| 파일                                     | 담고 있는 것                                                        | 출발 때 파일                                 |
| ---------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------- |
| `app/layout.tsx`                         | `<html>`/`<body>`, 폰트 `<link>`, 제목 template                     | `pages/_document.tsx`, `pages/_app.tsx`      |
| `app/providers.tsx`                      | `ThemeProvider` + styled-components registry (client)               | `pages/_app.tsx`                             |
| `lib/styled-registry.tsx`                | `useServerInsertedHTML`로 styled-components SSR                     | `pages/_document.tsx`의 `ServerStyleSheet`   |
| `components/AppShell.tsx`                | Nav(`styled(Link)`), Main, RenderedAt (client)                      | `components/Layout.tsx`                      |
| `app/page.tsx` + `List.tsx`              | 서버 컴포넌트에서 바로 데이터 조회 (Static)                         | `pages/index.tsx`                            |
| `app/posts/[id]/page.tsx`                | `generateStaticParams`, `dynamicParams`, `revalidate`, `notFound()` | `pages/posts/[id].tsx`                       |
| `app/ssr/page.tsx`                       | `headers()`, `searchParams`, `redirect()` (Dynamic)                 | `pages/ssr.tsx`                              |
| `app/client/page.tsx` + `ClientView.tsx` | `metadata`는 서버, 상태와 `dynamic(ssr: false)`는 client            | `pages/client.tsx`                           |
| `app/gallery/page.tsx` + `Hero.tsx`      | 새 `next/image` (`fill`, `sizes`, `style`)                          | `pages/gallery.tsx`                          |
| `app/not-found.tsx`                      | 없는 주소 처리                                                      | `pages/404.tsx`                              |
| `app/api/*/route.ts`                     | Route Handler (`time`은 `force-dynamic`)                            | `pages/api/*.ts`                             |
| `next.config.js`                         | `compiler.styledComponents`, `images.remotePatterns`, `redirects`   | `.babelrc`, `images.domains`, webpack 4 설정 |

### 출발: Next 10 + Pages Router (`next10-base` 태그)

| 파일                        | 담고 있는 것                                     | 버전업 포인트              |
| --------------------------- | ------------------------------------------------ | -------------------------- |
| `pages/index.tsx`           | SSG, `next/image`, `<Link><a>`                   | Link, Image                |
| `pages/posts/[id].tsx`      | ISR (`fallback: true`, `revalidate`, `notFound`) | fallback 동작              |
| `pages/ssr.tsx`             | SSR + `redirect`                                 |                            |
| `pages/client.tsx`          | CSR, `useEffect` fetch, `dynamic(ssr: false)`    | StrictMode                 |
| `pages/gallery.tsx`         | `next/image`의 `layout` 3종                      | Image                      |
| `pages/_document.tsx`       | styled-components SSR, 구글 폰트 `<link>`        | SWC, next/font, App Router |
| `components/Layout.tsx`     | `React.FC` children, `passHref` + styled `a`     | @types/react 18, Link      |
| `components/RenderedAt.tsx` | 서버/클라이언트 결과가 다른 렌더링               | 하이드레이션               |
| `next.config.js`            | `images.domains`, `redirects`, webpack 4 설정    | webpack 5                  |
| `.babelrc`                  | styled-components babel 플러그인                 | SWC                        |
| `scripts/smoke.mjs`         | 버전업 전후 동작 비교 테스트 (12개)              |                            |
| `baseline/`                 | Next 10 빌드 출력과 smoke 결과                   |                            |

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

1. **10 → 11** (2026-11-18): webpack 5에서 `config.node = { fs: 'empty' }` 때문에 빌드가 실패했다. 쓰는 곳이 없는 설정이라 `webpack` 블록을 주석 처리했고, smoke 12/12 통과. 자세한 내용은 [UPGRADE_NOTES.md의 10 → 11](./UPGRADE_NOTES.md#-실제로-해-보니-2026-11-18-1023--1114)
2. **11 → 12** (2026-11-18): `.babelrc`가 있으면 SWC가 꺼진다. `.babelrc`를 지우고 `compiler.styledComponents`로 옮겼더니 SSR과 displayName 모두 그대로 동작했고, smoke 12/12 통과. 그런데 공통 JS는 87.9 kB에서 90.4 kB로 오히려 늘었다. 자세한 내용은 [UPGRADE_NOTES.md의 11 → 12](./UPGRADE_NOTES.md#-실제로-해-보니-2026-11-18-1114--1237)
3. **12 → 13 (A. React 18 먼저)** (2026-11-19): Next 12에 그대로 있으면서 TS 5와 React 18을 먼저 올렸다. `React.FC`가 children을 자동으로 넣어 주지 않아서 타입 에러 8개가 났고, `Props`에 `children`을 적어서 해결했다. 하이드레이션 경고가 에러로 바뀌어서 `RenderedAt`에 `suppressHydrationWarning`을 붙였다. smoke 12/12 통과. 자세한 내용은 [UPGRADE_NOTES.md의 12 → 13](./UPGRADE_NOTES.md#-실제로-해-보니-2026-11-19-a-react-18-먼저-next-1237-그대로)
4. **12 → 13 (B. Next 13.5.11로 올리기)** (2026-11-19): 코드는 고치지 않고 Next만 올렸다. 빌드와 smoke는 통과했지만 HTML에 `<a>` 안에 `<a>`가 생겼고, dev에서는 `Invalid <Link> with <a> child` 에러가 났다. 검사가 dev 모드에서만 돌기 때문이다. 자세한 내용은 [UPGRADE_NOTES.md의 12 → 13 B](./UPGRADE_NOTES.md#-실제로-해-보니-2026-11-19-b-next-13511로-올리기-코드-수정-없이)
5. **12 → 13 (C. codemod)** (2026-11-19): `new-link`로 Link 안의 `<a>`를 없앴다. styled 컴포넌트를 자식으로 둔 `Layout`은 `legacyBehavior`로 미뤄 뒀다. Image는 `next-image-to-legacy-image`와 `next-image-experimental`을 차례로 돌려 새 Image로 바꿨다. codemod가 넣은 `sizes="100vw"`는 실제 레이아웃에 맞게 고쳤다. smoke 12/12 통과. 자세한 내용은 [UPGRADE_NOTES.md의 12 → 13 C](./UPGRADE_NOTES.md#-실제로-해-보니-2026-11-19-c-codemod로-link와-image-고치기)
6. **13 → 14** (2026-11-19): Node를 먼저 20으로 올리고 그다음 Next 14.2.35로 올렸다. 코드 수정 없이 빌드는 통과했다. `images.domains` 경고는 빌드가 아니라 실행 중에 나와서 `remotePatterns`로 바꿨다. 13에서 남았던 `fetchPriority` 경고는 14에서 사라졌다. smoke 12/12 통과. **1단계(Pages Router 유지) 완료.** 자세한 내용은 [UPGRADE_NOTES.md의 13 → 14](./UPGRADE_NOTES.md#-실제로-해-보니-2026-11-19-13511--14235)
7. **2단계 1. API → Route Handler** (2026-11-19): `pages/api/*`를 `app/api/*/route.ts`로 옮겼다. Next 14에서 GET Route Handler는 기본으로 캐시돼서, `/api/time`이 빌드한 시각만 계속 돌려줬다. `force-dynamic`으로 해결했다. smoke는 두 경우 모두 통과해서 이 차이를 못 잡았다. 자세한 내용은 [UPGRADE_NOTES.md의 2단계 1](./UPGRADE_NOTES.md#-실제로-해-보니-2026-11-19-1-api--route-handler)
8. **2단계 2. 공통 뼈대 + `/gallery` + 404** (2026-11-19): `app/layout.tsx`와 styled-components registry, ThemeProvider를 만들고 `/gallery`를 옮겼다. `app/`이 생기자마자 없는 주소를 App Router가 처리해서 smoke 404 검사가 실패했다. 그래서 404도 바로 `app/not-found.tsx`로 옮겼다. `@types/styled-components`가 React 17 시절 타입이라 5.1.36으로 올렸다. smoke 12/12 통과. 자세한 내용은 [UPGRADE_NOTES.md의 2단계 2](./UPGRADE_NOTES.md#-실제로-해-보니-2026-11-19-2-공통-뼈대--gallery--404)
9. **2단계 3. `/client`** (2026-11-19): page는 서버 컴포넌트로 두고 `metadata`만 정했다. 상태를 쓰는 부분은 `ClientView`(`'use client'`)로 뺐다. `'use client'`도 첫 HTML은 서버에서 그리기 때문에 `dynamic(ssr: false)`는 그대로 필요했다. `reactStrictMode: false`가 app에도 적용돼서 fetch 호출 횟수는 1이었다. 자세한 내용은 [UPGRADE_NOTES.md의 2단계 3](./UPGRADE_NOTES.md#-실제로-해-보니-2026-11-19-3-client)
10. **2단계 4. `/`(홈)** (2026-11-19): `getStaticProps`를 없애고 서버 컴포넌트에서 데이터를 바로 가져왔다. 그래도 `○ (Static)`으로 빌드할 때 한 번만 렌더링됐다. `title.template`이 layout과 같은 폴더의 page에는 적용되지 않아서, 홈만 전체 제목을 직접 적었다. First Load JS는 102 → 116 kB로 늘었다. 자세한 내용은 [UPGRADE_NOTES.md의 2단계 4](./UPGRADE_NOTES.md#-실제로-해-보니-2026-11-19-4--홈)
11. **2단계 5. `/posts/[id]`** (2026-11-19): `getStaticPaths`/`getStaticProps`를 `generateStaticParams`, `dynamicParams`, `revalidate`, `notFound()`로 바꿨다. 1단계 내내 200 + "로딩 중"이던 `/posts/999`가 처음으로 **404**를 응답했다. 그런데 `loading.tsx`를 넣으면 Suspense 때문에 다시 200이 됐다. 그래서 넣지 않았다. 자세한 내용은 [UPGRADE_NOTES.md의 2단계 5](./UPGRADE_NOTES.md#-실제로-해-보니-2026-11-19-5-postsid)
12. **2단계 6. `/ssr`** (2026-11-19): `getServerSideProps`를 `headers()`, `searchParams`, `redirect()`로 바꿨다. 요청 정보를 읽기만 해도 자동으로 동적 페이지가 됐고, `redirect()`도 307로 같았다. 모든 페이지가 app으로 옮겨져서 메뉴 이동에 전체 새로고침이 없어졌다. 자세한 내용은 [UPGRADE_NOTES.md의 2단계 6](./UPGRADE_NOTES.md#-실제로-해-보니-2026-11-19-6-ssr)
13. **2단계 7. 정리** (2026-11-19): `pages/_app.tsx`, `_document.tsx`, `components/Layout.tsx`를 지워서 `pages/` 폴더가 없어졌다. smoke 12/12. **2단계(App Router 이전) 완료.** 최종 비교는 [UPGRADE_NOTES.md의 최종 정리](./UPGRADE_NOTES.md#최종-정리-next-10-pages-router--next-14-app-router)

## ✅ 결과 & 배운 점 ✍️

- Next만 올리면 끝나지 않는다. Node, React, TS, @types/\*를 함께 맞춰야 하고, TS를 먼저 올려야 @types를 올릴 수 있다. (@types/styled-components는 App Router에서야 문제가 드러났다)
- 버전마다, 바꾸는 것마다 나눠서 커밋하니 무엇 때문에 깨졌는지 바로 알 수 있었다. (React 18을 Next 12에서 먼저 올림, Node 20을 Next 13에서 먼저 올림)
- 빌드와 smoke가 통과해도 끝이 아니다. dev 모드 콘솔, 서버 터미널, 빌드된 HTML을 직접 봐야 했다. (<a> 중첩, title 경고, 캐시된 API)
- codemod 결과도 검토해야 한다. sizes="100vw"는 레이아웃을 모르고 넣은 기본값이었다.
- App Router의 정적/동적은 "요청 정보를 읽는가"로 정해진다. 그래서 GET API는 몰래 캐시되고, getStaticProps 없는 홈은 알아서 Static이 됐다.
- loading.tsx(Suspense)를 넣으면 상태 코드가 먼저 200으로 정해진다. notFound()와 redirect()가 있는 페이지에서는 조심해야 한다.

## 🔗 참고 링크

- [Next.js 버전업 가이드 (14)](https://nextjs.org/docs/pages/guides/upgrading/version-14)
- [Codemods](https://nextjs.org/docs/app/guides/upgrading/codemods)
- [App Router 마이그레이션](https://nextjs.org/docs/app/guides/migrating/app-router-migration)
