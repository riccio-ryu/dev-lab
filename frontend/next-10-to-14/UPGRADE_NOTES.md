# Next 10 → 14 버전업 노트

> 정답 코드는 없습니다. **어디서 깨지는지**와 **찾아볼 키워드**만 적어 두었습니다.
> 막히면 대화에서 물어보면서 풀기.

## 0. 시작 전에

```bash
nvm use                 # .nvmrc → Node 16.14.2
npm install
npm run build && npm start      # 포트 3010
npm run smoke                   # 다른 터미널에서. 12/12 통과가 기준
```

- 지금 상태(Next 10.2.3)를 태그로 남겨 두면 언제든 돌아올 수 있다: `git tag next10-baseline`
- 기준 기록은 `baseline/`에 있다.
  - `build-next10.2.3.txt`: 페이지별 렌더링 방식(○ ● λ)과 번들 크기
  - `smoke-next10.2.3.txt`: 스모크 테스트 결과
- 버전을 올릴 때마다 `npm run baseline`을 실행하면 `baseline/build-next<버전>.txt`가 새로 생긴다. 이전 파일과 diff 해 보기.

### 단계마다 확인할 것

| 확인 | 명령 |
|---|---|
| 타입 에러 없음 | `npm run type-check` |
| 빌드 성공 + 렌더링 방식이 전과 같은지 | `npm run baseline` 후 이전 파일과 비교 |
| 동작이 전과 같은지 | `npm start` → `npm run smoke` |
| 브라우저 콘솔 경고 | `npm run dev` 후 모든 페이지를 열어 보기 (특히 `/`, `/client`) |

### 같이 올려야 하는 것들

Next만 올리면 끝나지 않는다. 각 단계에서 아래도 맞는 버전인지 확인한다.

- Node (`.nvmrc`)
- `react`, `react-dom`, `@types/react`, `@types/react-dom`
- `typescript`, `@types/node`
- `styled-components`, `babel-plugin-styled-components` (언젠가는 필요 없어진다)
- `next-env.d.ts` (Next가 알아서 다시 만들어 주는지 지켜보기)

> 💡 이 프로젝트를 만들면서 실제로 겪은 일: 최신 `@types/node`, `@types/react`는 TS 4.3에서 문법 에러가 나서 2021년 버전으로 고정했다. 거꾸로 버전을 올릴 때는 **TS를 먼저 올려야 `@types/*`도 올릴 수 있다.**

---

## 1단계: Pages Router를 유지하고 14까지

바로 14로 점프해도 되지만, 아래처럼 버전별로 나눠서 올리고 **버전마다 커밋**하면 무엇이 언제 바뀌었는지 기록으로 남는다.

### 10 → 11

| 어디서 | 무슨 일 | 찾아볼 키워드 |
|---|---|---|
| `next.config.js`의 `webpack` | 지금은 빌드 로그에 `Using webpack 4. Reason: custom webpack configuration`이 찍힌다. 11에서는 커스텀 설정이 있어도 webpack 5가 기본이다 | webpack 5 `config.node`, `resolve.fallback` |
| 린트 | `next lint`가 새로 생겼다 | `eslint-config-next` |
| Node | 최소 요구 버전이 올라간다 | 공식 가이드의 Node 최소 버전 |

❓ 생각해 볼 것: `config.node = { fs: 'empty' }`는 애초에 이 프로젝트에 필요했을까?

### 11 → 12

| 어디서 | 무슨 일 | 찾아볼 키워드 |
|---|---|---|
| `.babelrc` | 12부터 Babel 대신 **SWC**로 컴파일한다. 그런데 `.babelrc`가 있으면 SWC가 꺼진다. 빌드 로그를 잘 읽어 보기 | `compiler.styledComponents`, SWC |
| 미들웨어 | 새 기능 (이 프로젝트에선 선택 사항) | `middleware.ts` |
| React 18 | 12에서는 선택, 13부터는 필수 | |

❓ `.babelrc`를 지웠을 때 styled-components SSR이 그대로 동작하는지는 어떻게 확인할까? (힌트: smoke의 `data-styled` 검사, 그리고 dev 모드 콘솔의 className 경고)

### 12 → 13 ⚠️ 가장 많이 깨지는 단계

| 어디서 | 무슨 일 | 찾아볼 키워드 |
|---|---|---|
| React 17 → 18 | 필수. `@types/react` 18에서 타입 에러가 터진다 | `React.FC` children, `PropsWithChildren` |
| `next/link` | `<Link><a>...</a></Link>` 구조가 바뀐다. `components/Layout.tsx`의 `passHref` + styled `a` 조합이 특히 까다롭다 | `@next/codemod new-link`, `legacyBehavior` |
| `next/image` | 컴포넌트가 새로 바뀌었다. `layout`, `objectFit` 속성이 없어진다 (`pages/gallery.tsx`) | `next/legacy/image`, `next-image-to-legacy-image`, `fill`, `sizes` |
| 하이드레이션 | React 18은 서버/클라이언트 렌더링 결과가 다르면 훨씬 엄격하게 처리한다. `components/RenderedAt.tsx`를 dev 모드에서 확인하기 | hydration mismatch, `suppressHydrationWarning` |
| StrictMode | `reactStrictMode: true`를 켜면 dev에서 `/client`의 "fetch 호출 횟수"가 어떻게 되는가? | React 18 StrictMode effect 두 번 실행 |
| 폰트 | `_document`의 구글 폰트 `<link>`를 대체하는 기능이 생겼다 | `@next/font` (13.0), `next/font` (13.2+) |
| TypeScript | 최소 요구 버전이 올라간다 | |
| 브라우저 | IE11 지원 중단 | |

❓ codemod를 돌리기 **전에** 커밋해 두면 좋은 이유는?

### 13 → 14

| 어디서 | 무슨 일 | 찾아볼 키워드 |
|---|---|---|
| Node | **18.17 이상** 필요. 이 맥에 깔린 18.16.1은 안 된다 → 20 사용 | `.nvmrc` |
| `images.domains` | deprecated 경고 | `images.remotePatterns` |
| `@next/font` | 패키지 제거 | `next/font` |
| `next export` | 명령어 제거 (이 프로젝트는 안 쓰지만 알아 두기) | `output: 'export'` |

### 버전마다 관찰할 것

- `/posts/999`(없는 글)를 `curl -i`로 요청해 보기. Next 10에서는 `fallback: true` 때문에 **첫 응답이 200 + "로딩 중" 화면**이다. 버전이 올라가면서 바뀌는가?
- `baseline/build-*.txt`에서 First Load JS 크기가 어떻게 변하는가? (SWC, React 18 영향)

---

## 2단계: App Router로 옮기기

1단계가 끝나 14 + Pages Router에서 smoke가 12/12 통과한 뒤에 시작한다.
`pages/`와 `app/`은 함께 쓸 수 있으니 **페이지 하나씩** 옮기고 매번 smoke를 돌린다. (같은 경로가 양쪽에 있으면 에러)

| Pages Router | App Router에서는? (키워드) |
|---|---|
| `_app.tsx`, `_document.tsx` | `app/layout.tsx` |
| `next/head` | Metadata API (`metadata`, `generateMetadata`) |
| `getStaticProps` | 서버 컴포넌트에서 직접 데이터 가져오기 |
| `getStaticPaths` + `fallback` | `generateStaticParams`, `dynamicParams` |
| `revalidate: 60` | 라우트 세그먼트 설정 `export const revalidate` |
| `getServerSideProps` | 동적 렌더링 (`headers()`, `dynamic`) |
| `redirect` / `notFound` 반환 | `redirect()`, `notFound()` 함수 |
| `pages/404.tsx` | `not-found.tsx` |
| `router.isFallback` 로딩 화면 | `loading.tsx` |
| `next/router` | `next/navigation` |
| `pages/api/*` | Route Handlers (`route.ts`) |
| `dynamic(..., { ssr: false })` | `'use client'` 경계와 함께 다시 생각하기 |
| styled-components `ServerStyleSheet` | ⚠️ 서버 컴포넌트에서는 쓸 수 없다. `useServerInsertedHTML`, style registry |

❓ 추천 이전 순서: API → 정적 페이지(`/404`, `/gallery`) → `/client` → `/` → `/posts/[id]` → `/ssr` → 마지막에 `_app`/`_document` 제거. 왜 이 순서일까?

---

## 공식 문서

- [Version 11](https://nextjs.org/docs/pages/guides/upgrading/version-11) · [12](https://nextjs.org/docs/pages/guides/upgrading/version-12) · [13](https://nextjs.org/docs/pages/guides/upgrading/version-13) · [14](https://nextjs.org/docs/pages/guides/upgrading/version-14)
- [Codemods](https://nextjs.org/docs/app/guides/upgrading/codemods)
- [Pages → App Router 마이그레이션](https://nextjs.org/docs/app/guides/migrating/app-router-migration)
