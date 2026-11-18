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

#### ✅ 실제로 해 보니 (2026-11-18, 10.2.3 → 11.1.4)

- **깨진 곳**: `next build`가 `ValidationError: Invalid configuration object. Webpack has been initialized using a configuration object that does not match the API schema.`로 실패했다.
  - 원인: webpack 5는 `node` 옵션에 `fs: 'empty'` 같은 값을 받지 않는다. webpack 4 전용 문법이었다.
  - `npm run baseline`은 `tee`로 stdout만 저장하기 때문에 에러는 파일에 남지 않고 빌드 로그가 중간에 끊긴다.
- **고친 방법**: `next.config.js`의 `webpack` 블록을 통째로 주석 처리했다. 전후를 한눈에 비교하려고 지우지 않고 남겨 두었다.
  - 이유: `pages/`, `components/`, `lib/` 어디에서도 `fs`를 import하지 않는다. 클라이언트 번들에서 `fs`를 빈 모듈로 바꿀 일이 처음부터 없었고, 아무 일도 하지 않던 설정이었다. (❓의 답: 필요 없었다)
  - 정말 필요했다면 webpack 5에서는 `config.resolve.fallback = { ...config.resolve.fallback, fs: false }`로 쓴다.
  - 덤으로, 커스텀 webpack 설정이 없어졌으니 12 이후 버전업에서도 신경 쓸 곳이 하나 줄었다.
- **결과**
  - smoke 12/12 통과
  - 렌더링 방식(● ○ λ)은 10과 같다. `/posts/[id]` 옆에 `(ISR: 60 Seconds)`가 새로 표시된다.
  - First Load JS 공통 부분이 78.5 kB에서 81.4 kB로 늘었다. webpack 5가 chunk를 나누는 방식이 달라서 `commons` chunk가 없어지고 `main`과 `_app`이 커졌다.
  - `next-env.d.ts`에 `next/image-types/global` 참조가 자동으로 추가됐다.
- **dev 모드 콘솔**
  - `/`: `Warning: Text content did not match. Server: "오후 10:32:49" Client: "오후 10:32:50"`. `RenderedAt`이 일부러 서버와 클라이언트에서 다른 값을 그리게 만든 부분이라, 이번 버전업 때문에 생긴 경고는 아니다. React 18(12 → 13)에서 어떻게 달라지는지 다시 본다.
  - `/client`: 경고 없음
  - `favicon.ico` 404: `public/`에 파비콘이 없어서 나는 것이고 버전업과는 관계없다.
- **무시해도 되는 것**: `npm start` 때 나오는 `sharp` 경고. 프로덕션 이미지 최적화용 선택 패키지를 설치하라는 권장일 뿐이다.

### 11 → 12

| 어디서 | 무슨 일 | 찾아볼 키워드 |
|---|---|---|
| `.babelrc` | 12부터 Babel 대신 **SWC**로 컴파일한다. 그런데 `.babelrc`가 있으면 SWC가 꺼진다. 빌드 로그를 잘 읽어 보기 | `compiler.styledComponents`, SWC |
| 미들웨어 | 새 기능 (이 프로젝트에선 선택 사항) | `middleware.ts` |
| React 18 | 12에서는 선택, 13부터는 필수 | |

❓ `.babelrc`를 지웠을 때 styled-components SSR이 그대로 동작하는지는 어떻게 확인할까? (힌트: smoke의 `data-styled` 검사, 그리고 dev 모드 콘솔의 className 경고)

#### ✅ 실제로 해 보니 (2026-11-18, 11.1.4 → 12.3.7)

두 번에 나눠 진행했다. Next 12.3.7은 Node 12.22 이상과 React 17.0.2 또는 18을 요구해서 Node와 React는 그대로 뒀다.

**A. Next만 올리기**: 빌드와 smoke 모두 그대로 통과했다.
- 빌드 로그에 `Disabled SWC as replacement for Babel because of custom Babel configuration ".babelrc"`가 찍혔다. `.babelrc`가 있으면 Next 12는 SWC를 끄고 Babel을 계속 쓴다.
- 결과 파일: `baseline/build-next12.3.7-babel.txt`
  - B에서 버전이 같아 `npm run baseline`이 같은 파일 이름으로 덮어쓰기 때문에 이름을 바꿔 두었다.

**B. SWC로 바꾸기**
- `.babelrc`를 지우고, `next.config.js`에 `compiler: { styledComponents: true }`를 추가했다.
  - `.babelrc`에 있던 `ssr: true`, `displayName: true`는 SWC에서 기본으로 켜져 있다.
- `babel-plugin-styled-components`를 제거했다.
- 확인 결과
  - 빌드 로그에서 `Disabled SWC` 줄이 사라졌다.
  - smoke 12/12 통과 (`data-styled` 검사 포함)
  - dev 콘솔에 ``Prop `className` did not match`` 경고가 없다. 서버와 브라우저의 styled-components 클래스 이름이 같다는 뜻이다.
  - 클래스 이름이 `Layout__Nav-sc-6183e77a-0`처럼 나와서 displayName도 동작한다.
- `next-env.d.ts`: `next/types/global` 참조를 Next가 자동으로 지웠다.

**번들 크기 (공통 First Load JS)**

| 11.1.4 | 12.3.7 Babel | 12.3.7 SWC |
|---|---|---|
| 81.4 kB | 87.9 kB | 90.4 kB |

- 11 → 12에서 늘어난 6.5 kB는 주로 `main` chunk에서 왔다 (23.4 → 29.6 kB).
- SWC로 바꾸자 오히려 2.5 kB가 늘었다. Next 12의 SWC는 코드 변환만 맡고 압축은 여전히 Terser가 한다 (`swcMinify`는 13부터 기본). 늘어난 정확한 이유는 아직 확인하지 않았다.

**dev 콘솔에서 새로 본 것**: `Image with src "/logo.png" was detected as the Largest Contentful Paint (LCP)`.
- 화면 위쪽의 큰 이미지에 `priority`를 붙이라는 권장으로, 12에서 새로 생겼다.
- 버전업과는 관계없어서 그대로 뒀다.

**놓칠 뻔한 것**: `npm run dev`를 실행하면 `.next`가 dev용으로 덮어써진다. dev로 콘솔을 확인한 뒤 smoke를 돌릴 때는 `npm run build`부터 다시 해야 한다. 프롬프트 시각을 보니 처음 돌린 smoke는 SWC로 바꾸기 전 서버에서 돌린 결과였다.

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

#### ✅ 실제로 해 보니 (2026-11-19) A. React 18 먼저 (Next 12.3.7 그대로)

Next 12.3.7은 React 17과 18을 둘 다 지원한다. 그래서 Next 13으로 올리기 전에 React부터 올려 두었다. 이렇게 하면 에러가 React 때문인지 Next 때문인지 헷갈리지 않는다.

**올린 것**: 노트에 적어 둔 대로 TS를 먼저 올렸다.
- `typescript` 4.3.5 → 5.9.3
- `@types/react` 17 → 18, `@types/react-dom` 17 → 18
- `@types/node` 14 → 16: 실제로 쓰는 Node 16에 맞췄다. Node 20은 13 → 14에서 올린다.
- `react`, `react-dom` 17.0.2 → 18.3.1

**타입 에러: 8개, 원인은 하나**
- `Property 'children' does not exist on type 'Props'`. `Layout.tsx`에서 1개, `Layout`을 쓰는 페이지 7개에서 각각 1개씩 났다.
- `@types/react` 18부터 `React.FC`가 children을 자동으로 넣어 주지 않는다.
- `Layout.tsx`의 `Props`에 `children: React.ReactNode`를 적어서 해결했다. 이전 코드는 비교하려고 주석으로 남겨 두었다.

**하이드레이션: 경고가 에러로 바뀌었다**
- React 17에서는 콘솔 경고(`Warning: Text content did not match`)였다. React 18 dev 모드에서는 `Unhandled Runtime Error: Text content does not match server-rendered HTML.` 오버레이가 뜬다.
- 프로덕션에서도 React 18은 서버 HTML을 버리고 클라이언트에서 다시 그린다. smoke는 통과해도 그냥 두면 안 된다.
- `RenderedAt`은 `Layout` 안에 있어서 모든 페이지에 들어간다. 그래서 서버와 브라우저가 그리는 사이에 "초"가 바뀌는 타이밍이면 어느 페이지에서든 에러가 났다. `/`와 `/client`에서 둘 다 확인했다.
- 해결: `<Footer suppressHydrationWarning>`. 서버가 렌더링한 시각을 보여 주는 게 이 컴포넌트의 목적이라, `useEffect`로 클라이언트에서만 그리는 대신 이 방법을 골랐다.

**결과**
- type-check 에러 0개, smoke 12/12 통과
- `/client`의 fetch 호출 횟수는 1이다. `reactStrictMode: false`라서 그렇다.
- 공통 JS: 90.4 kB → 93.6 kB. `framework` chunk(React 본체)가 42 kB → 45.2 kB로 커졌다.
- `baseline/build-next12.3.7-react18.txt`에 저장했다. Next 버전이 같아서 `npm run baseline`을 쓰면 기존 파일을 덮어쓰기 때문에 `npm run build | tee ...`로 따로 저장했다.
- `tsconfig.json`: TS 5로 바꾼 뒤 처음 빌드할 때 Next가 `"incremental": true`를 자동으로 추가했다.

**덤: 포맷 문제**
- 저장할 때 에디터가 자동으로 포맷해서 파일 전체가 큰따옴표와 세미콜론 스타일로 바뀌었다. 그 바람에 바꾼 줄이 diff에 묻혔다.
- `.prettierrc`(`singleQuote`, `semi: false`, `printWidth: 120`)를 추가하고 원래 스타일로 되돌렸다.

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
