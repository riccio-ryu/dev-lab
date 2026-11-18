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

#### ✅ 실제로 해 보니 (2026-11-19) B. Next 13.5.11로 올리기 (코드 수정 없이)

일부러 코드는 고치지 않고 Next만 올렸다. 무엇이 깨지는지 보려는 단계다.

**빌드와 smoke는 통과했다.** 빌드가 깨질 거라고 예상했는데 틀렸다.
- Next의 `client/link.js`를 보면 `Invalid <Link> with <a> child` 검사가 `process.env.NODE_ENV === "development"`일 때만 돈다.
- Image의 `has legacy prop "layout". Did you forget to run the codemod?` 경고도 dev에서만 나온다.
- 그래서 `next build`와 smoke는 둘 다 통과했다.

**그런데 결과물은 망가져 있다.** 빌드된 `.next/server/pages/index.html`을 열어 보면 이렇다.
```html
<a href="/"><a class="sc-...">홈</a></a>
<li><a href="/posts/1"><a>Next 10 시작하기</a></a>
```
- Next 13의 `Link`는 직접 `<a>`를 만든다. 그 안에 원래 넣어 둔 `<a>`가 그대로 들어가서 `<a>` 안에 `<a>`가 생겼다.
- HTML 규칙상 허용되지 않는 구조이고, 안쪽 `<a>`에는 `href`도 없다.
- smoke는 상태 코드와 글자만 검사해서 이 문제를 못 잡는다.
- 반면 `gallery`의 `layout="fill"` + `objectFit="cover"`는 Next 13이 `fill`과 `object-fit:cover`로 바꿔서 정상적으로 그렸다. 예전 속성을 아직 호환 처리해 준다.

**dev 모드에서는 바로 깨진다.**
- `/`를 열면 `Server Error: Invalid <Link> with <a> child. Please remove <a> or use <Link legacyBehavior>.` 오버레이가 뜬다.
- 모든 페이지가 쓰는 `Layout`에 Link가 있어서 다른 페이지도 같다. 그래서 `/gallery`의 Image 경고는 Link를 고치기 전까지 볼 수 없다.

**배운 점**: 빌드와 smoke가 통과해도 dev 모드를 꼭 열어 봐야 한다. "단계마다 확인할 것"에 dev 콘솔 확인이 들어 있는 이유다.

**번들 크기**: 공통 JS 93.6 kB → 94.6 kB (`baseline/build-next13.5.11.txt`)

**❓의 답 (codemod 전에 커밋하는 이유)**: 이 상태를 먼저 커밋해 두면 다음 커밋의 diff가 codemod가 바꾼 것만 남는다. codemod 결과가 마음에 안 들면 `git checkout .` 한 번으로 되돌릴 수 있다.

#### ✅ 실제로 해 보니 (2026-11-19) C. codemod로 Link와 Image 고치기

**codemod 공통으로 겪은 것**
- **안전장치**: 처음 실행하면 `please stash or commit your git changes`라는 메시지와 함께 멈춘다. 이 검사는 폴더가 아니라 `dev-lab` 저장소 전체를 본다. 그래서 추적하지 않는 다른 실습 폴더 때문에 걸렸다. 이 폴더는 이미 커밋해 둔 상태라 `--force`로 건너뛰었다.
- **경로**: `pages components`처럼 경로를 두 개 주면 첫 번째만 처리됐다. `.`로 주면 `node_modules`와 `.next`는 자동으로 제외된다.
- **포맷**: codemod도 큰따옴표와 세미콜론을 넣는다. 매번 `npx prettier@3.3.3 --write <파일>`로 맞췄다.
- **미리보기**: `--dry --print`를 붙이면 파일을 바꾸지 않고 결과만 볼 수 있다.

**Link: `npx @next/codemod@13.5.11 new-link . --force`** (커밋 `4ac808f`)
- `<Link><a>글</a></Link>`는 안쪽 `<a>`를 없애고 `<Link>글</Link>`로 바꿨다. `index.tsx`에서 2곳, `404.tsx`에서 1곳이다.
- `<Link passHref><NavLink>`(`Layout.tsx`)는 자식이 styled `a`라서 자동으로 바꾸지 못했다. 대신 `legacyBehavior`를 붙여서 예전 방식을 그대로 유지했다. **고친 게 아니라 미뤄 둔 것이다.**
- 확인한 것
  - dev 에러가 사라졌다.
  - 빌드 HTML에서 `<a>` 중첩이 0개가 됐다. 메뉴는 `<a href="/" class="sc-...">홈</a>`, 글 목록은 `<a href="/posts/1">`로 `<a>`가 하나씩만 남았다.

**Image: codemod 두 개를 순서대로 돌렸다**
1. `next-image-to-legacy-image`: `next/image` → `next/legacy/image`. 예전 컴포넌트를 그대로 쓰는 방법이라 이것만 하면 미뤄 두는 것과 같다.
2. `next-image-experimental`: `next/legacy/image` → 새 `next/image`. 1번 없이 바로 돌리면 아무것도 바뀌지 않는다(`unmodified`).

| 예전 | 새 Image (codemod 결과) |
|---|---|
| `layout="fill"` `objectFit="cover"` | `fill` + `sizes` + `style={{ objectFit: 'cover' }}` |
| `layout="responsive"` | `sizes` + `style={{ width: '100%', height: 'auto' }}` |
| `layout="fixed"` | 속성 없음. 새 Image의 기본 동작이 고정 크기다 |
| `layout` 없음 (`index.tsx` 로고) | `style={{ maxWidth: '100%', height: 'auto' }}` |

- **놓치기 쉬운 것**: 예전 Image의 기본값은 `intrinsic`이었다. 원래 크기로 보이다가 화면이 더 좁으면 함께 줄어드는 방식이다. 새 Image의 기본값은 고정 크기다. 그래서 `layout`을 안 쓴 로고에도 codemod가 style을 붙였다. 로고가 120px로 보이고 창을 줄이면 함께 줄어드는 것을 확인했다.

**codemod 결과도 검토해야 한다: `sizes="100vw"`**
- codemod가 넣은 `sizes="100vw"` 때문에 dev에서 `has "fill" but is missing "sizes"` 경고가 계속 났다.
- Next 코드를 보면 이 경고는 `sizes`가 없을 때뿐만 아니라 **`sizes`가 `100vw`인데 실제 너비가 화면의 60%보다 좁을 때**도 나온다.
- 이 프로젝트는 `Layout`의 `Main`이 `max-width: 720px`이다. 그래서 `sizes`를 `'(max-width: 720px) 100vw, 672px'`(720px에서 좌우 padding 24px씩을 뺀 값)로 바꾸니 경고가 사라졌다.
- `sizes`는 브라우저가 어떤 크기의 이미지 파일을 받을지 정하는 힌트다. 틀리면 필요 이상으로 큰 이미지를 받는다.

**남은 경고 (그대로 둠)**
- `React does not recognize the fetchPriority prop`: Next 13.5는 React 18.3 이상이면 `fetchPriority`(camelCase)를 넘기도록 짜여 있다(`client/image-component.js`의 `getDynamicProps`). 그런데 실제 React 18.3에는 이 지원이 들어가지 않았다(React 19에 들어감). dev 모드에서만 나오는 경고라 그대로 뒀다. 없애려면 React를 18.2.0으로 고정하면 된다. Next 14에서 다시 본다.
- LCP `priority` 권장: 버전업과 관계없다.

**결과**: type-check 에러 0개, smoke 12/12 통과

### 13 → 14

| 어디서 | 무슨 일 | 찾아볼 키워드 |
|---|---|---|
| Node | **18.17 이상** 필요. 이 맥에 깔린 18.16.1은 안 된다 → 20 사용 | `.nvmrc` |
| `images.domains` | deprecated 경고 | `images.remotePatterns` |
| `@next/font` | 패키지 제거 | `next/font` |
| `next export` | 명령어 제거 (이 프로젝트는 안 쓰지만 알아 두기) | `output: 'export'` |

#### ✅ 실제로 해 보니 (2026-11-19, 13.5.11 → 14.2.35)

**Node를 먼저, Next는 그다음에**: Node 때문에 생긴 문제인지 Next 때문에 생긴 문제인지 구분하려고 순서를 나눴다.
1. Node 바꾸기
   - `.nvmrc`를 16.14.2 → 20.12.2로 바꾸고 `@types/node`를 20으로 올렸다.
   - `node_modules`를 지우고 다시 설치한 뒤, Next 13 그대로 빌드가 되는지 먼저 확인했다.
2. `next@14.2.35`로 올렸다. 코드 수정 없이 빌드와 smoke가 통과했다.

**`nvm`에서 헷갈린 것**
- `.nvmrc`는 "이 프로젝트는 이 버전을 쓴다"는 메모일 뿐이다. `nvm use`를 실행해야 실제로 바뀌고, 바뀐 버전도 그 터미널에서만 유지된다.
- 이 맥의 기본 Node는 24다. 그래서 새 터미널을 열면 매번 `nvm use`를 해야 한다. smoke를 돌리는 터미널도 마찬가지다.

**`images.domains` 경고: 빌드가 아니라 실행 중에 나온다**
- 빌드 로그에는 경고가 없었다. 처음에는 `server/config.js`만 보고 "14.2.35에는 경고가 없다"고 잘못 판단했다.
- 실제 경고 `⚠ The "images.domains" configuration is deprecated`는 `server/image-optimizer.js`에 있었다. 서버가 외부 이미지를 처음 최적화할 때 한 번 나온다. dev에서 `/gallery`를 열었을 때 찍혔다.
- 고친 것: `remotePatterns: [{ protocol: 'https', hostname: 'picsum.photos', pathname: '/id/**' }]`. 예전 `domains`는 주석으로 남겼다.
- `domains`는 도메인만 맞으면 모든 경로를 허용한다. `remotePatterns`는 경로까지 좁힐 수 있다. `curl`로 확인했다.
  - `/_next/image?url=https://picsum.photos/id/1015/...` → **200**
  - `/_next/image?url=https://picsum.photos/200` → **400** (`/id/**` 밖이라 거부)

**`fetchPriority` 경고가 사라졌다 (13에서 미뤄 둔 것)**
- Next 14.2의 `image-component.js`는 "React 19 이상(`React.use`가 있는지)"을 기준으로 camelCase 속성을 보낸다.
- React 18.3.1에서는 소문자 `fetchpriority`를 보내서 경고가 없다. React를 18.2로 고정할 필요가 없어졌다.

**서버 터미널의 `title` 경고 (버전업과 직접 관계없음)**
- `Warning: A title element received an array with more than 1 element as children`이 요청마다 찍혔다.
- 원인: `<title>{title} | next-10-to-14</title>`의 children이 `['홈', ' | next-10-to-14']` 배열이 된다.
- 해결: `` <title>{`${title} | next-10-to-14`}</title> ``로 문자열 하나로 합쳤다.
- 브라우저 콘솔이 아니라 **서버 터미널**에만 찍혀서 지금까지 놓쳤다. React 18.3에서 생긴 경고라 13에서도 나왔을 가능성이 크다.

**무시해도 되는 것**
- `GET /_next/webpack-hmr?page=%2Fclient 404`: 이전 dev 서버 때부터 열려 있던 탭이 다시 연결하려는 요청이다.
- `GET /.well-known/appspecific/com.chrome.devtools.json 404`: Chrome 개발자 도구가 자동으로 보내는 요청이다.

**그 밖에 바뀐 것**
- 빌드 표의 `λ (Server)`가 `ƒ (Dynamic)`으로 바뀌었다. 기호와 이름만 바뀌고 의미는 같다.
- `next-env.d.ts`: 안내 주석의 문서 링크를 Next가 자동으로 바꿨다.

**놓칠 뻔한 것**: smoke 결과를 두 번이나 이전 상태에서 복사했다. 프롬프트 시각을 빌드와 파일 수정 시각과 비교해서 알아챘다. smoke는 **마지막 빌드 이후에** 돌린 결과인지 꼭 확인한다.

**결과**: type-check 에러 0개, smoke 12/12 통과 (Next 14.2.35 + Node 20.12.2)

### 버전마다 관찰할 것

#### ✅ 1단계를 마치고 정리 (2026-11-19)

**`/posts/999`(없는 글)는 14에서도 `200` + "로딩 중"이다.**
- `fallback: true`일 때 처음 요청하면 일단 로딩 화면을 보낸다. 이 동작은 Pages Router에서는 10부터 14까지 그대로다.
- 브라우저에서는 그다음에 데이터를 받아 `notFound`를 처리한다. `curl`처럼 JS를 실행하지 않으면 로딩 화면만 보인다.
- App Router로 옮기면 바뀌는 지점이다 (`dynamicParams`, `notFound()`).

**공통 First Load JS**

| 단계 | 크기 | 주로 늘어난 곳 |
|---|---|---|
| 10.2.3 | 78.5 kB | |
| 11.1.4 | 81.4 kB | webpack 5가 chunk를 나누는 방식이 바뀜 |
| 12.3.7 (Babel) | 87.9 kB | `main` (Next 런타임) |
| 12.3.7 (SWC) | 90.4 kB | `main`. SWC로 바꿨는데 오히려 늘었다 |
| 12.3.7 + React 18 | 93.6 kB | `framework` (React 본체) |
| 13.5.11 | 94.6 kB | |
| 14.2.35 | 95 kB | |

- 10 → 14에서 **+16.5 kB(약 21%)** 늘었다. 가장 많이 늘어난 건 Next 12로 올린 것(+6.5)과 React 18(+3.2)이다.

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

### 2단계 진행 방식 (2026-11-19)

- **예전 파일은 지우고 git으로 비교한다.** `pages/` 안의 파일은 있기만 해도 경로가 된다. 주석으로 남기면 "default export가 없다"는 에러가 나고, `app/`에 같은 경로가 있으면 충돌한다.
  - 1단계 끝 지점에 `next14-pages` 태그를 달았다.
  - 비교는 `git diff next14-pages -- pages/<파일> app/<폴더>`로 한다.
- **실제 순서**: API를 맨 먼저 했다. 화면이 없어서 styled-components나 레이아웃과 상관없이 혼자 옮길 수 있기 때문이다. 페이지를 옮기기 전에는 `app/layout.tsx`와 styled-components registry를 먼저 준비해야 한다.

#### ✅ 실제로 해 보니 (2026-11-19) 1. API → Route Handler

| Pages Router (`pages/api/time.ts`) | Route Handler (`app/api/time/route.ts`) |
|---|---|
| `handler(req, res)` 하나에서 `req.method`로 나눔 | 메서드마다 함수를 따로 export (`GET`, `POST` ...) |
| `res.status(200).json(...)` | 웹 표준 `Response.json(...)` 반환 |
| 405를 직접 처리 (`Allow` 헤더 포함) | 없는 메서드는 Next가 405를 자동으로 돌려준다. `/api/posts`는 `GET`만 만들었다 |
| 요청마다 실행 | **GET은 기본으로 정적(캐시)** |

**함정: GET Route Handler는 기본으로 캐시된다 (Next 14)**
- `export const dynamic = 'force-dynamic'` 없이 빌드하고 `curl`을 2초 간격으로 두 번 요청했다.
  ```
  {"now":"2026-11-18T16:13:01.013Z"}
  {"now":"2026-11-18T16:13:01.013Z"}   ← 같다. 빌드한 시각(01:13 KST)이 그대로 나온다
  ```
- `force-dynamic`을 켜고 다시 빌드했다.
  ```
  {"now":"2026-11-18T16:16:22.998Z"}
  {"now":"2026-11-18T16:16:25.045Z"}   ← 2초 차이. 요청마다 실행된다
  ```
- **smoke는 두 경우 모두 12/12 통과했다.** `"now"`라는 글자가 있는지만 검사해서 동작이 몰래 바뀐 걸 못 잡는다. 옮길 때는 "요청마다 달라져야 하는 값"을 직접 확인해야 한다.
- `/api/posts`는 고정 데이터라 캐시돼도 괜찮아서 그대로 뒀다.

**Next가 자동으로 바꾼 것** (처음으로 `app/`을 빌드할 때)
- `tsconfig.json`에 `"plugins": [{ "name": "next" }]`와 `include`의 `".next/types/**/*.ts"`가 추가됐다.
- `next-env.d.ts`의 문서 링크가 `pages/...`에서 `app/...`으로 바뀌었다.

#### ✅ 실제로 해 보니 (2026-11-19) 2. 공통 뼈대 + `/gallery` + 404

| 새 파일 | 하는 일 | 대신하는 것 |
|---|---|---|
| `app/layout.tsx` | `<html>`, `<head>`(폰트 link), `<body>`, `globals.css`, 제목 template(`%s \| next-10-to-14`) | `_document`, `_app`, `Layout`의 `<title>` |
| `lib/styled-registry.tsx` | 서버 렌더링 중에 만든 스타일을 `useServerInsertedHTML`로 HTML에 넣는다 | `_document`의 `ServerStyleSheet` |
| `app/providers.tsx` | registry와 `ThemeProvider` (`'use client'`) | `_app`의 `ThemeProvider` |
| `components/AppShell.tsx` | Nav, Main, RenderedAt (`'use client'`) | `components/Layout.tsx`. pages가 남아 있는 동안은 둘 다 둔다 |
| `app/gallery/page.tsx` + `Hero.tsx` | 갤러리. page는 서버 컴포넌트, styled `Hero`만 클라이언트 파일로 뺐다 | `pages/gallery.tsx` |
| `app/not-found.tsx` | 없는 주소 처리 | `pages/404.tsx` |

**`'use client'` 경계**
- styled-components는 Context를 쓰기 때문에 서버 컴포넌트에서 만들 수 없다. 그래서 `AppShell`과 `Hero`는 클라이언트 컴포넌트로 만들었다.
- `metadata`는 서버 컴포넌트에서만 export할 수 있다. 그래서 page 전체를 `'use client'`로 만들지 않고, styled 부분만 별도 파일로 뺐다.

**`legacyBehavior` 해결**
- `AppShell`에서는 `NavLink = styled(Link)`로 만들었다. 빌드된 HTML에 `<a class="..." href="/">홈</a>`처럼 `<a>`가 하나만 나온다.

**막힌 것**
1. `Property 'clearTag' does not exist on type 'ServerStyleSheet'`
   - `@types/styled-components` 5.x는 `instance`를 `this`(ServerStyleSheet 자신)로 적어 두었다. 실제 값은 내부 StyleSheet 객체라 `clearTag`가 있다.
   - 타입을 직접 맞추는 한 줄을 넣었다. styled-components v6에서는 필요 없다.
2. `StyleSheetManager`에 `children`을 넣을 수 없다는 에러
   - React 18의 children 문제와 같은 원인이다. `@types/styled-components` 5.1.10에는 `children`이 빠져 있다.
   - 5.1.36으로 올려서 해결했다. 사실 12 → 13의 React 18 단계에서 함께 올렸어야 하는 패키지였다. 그때는 `StyleSheetManager`를 직접 쓰지 않아서 드러나지 않았다.
3. **smoke 11/12: `없는 페이지 (GET /nope)` 실패**
   - `app/`이 생기면 Next가 `/_not-found`를 자동으로 만든다. 그때부터 어디에도 없는 주소는 `pages/404.tsx`가 아니라 App Router가 처리한다.
   - 그래서 상태 코드는 404였지만 화면에는 Next 기본 문구(`This page could not be found`)가 나왔다.
   - 마지막에 하려던 404를 지금 `app/not-found.tsx`로 옮겼다. ❓의 추천 순서에서 `/404`가 앞쪽에 있던 이유다.

**결과**
- smoke 12/12
- `/gallery` 제목은 `갤러리 | next-10-to-14`, `/nope` 제목은 `404 | next-10-to-14`다.
- `/gallery`의 HTML에 `data-styled` 스타일 태그가 들어 있다.
- app과 pages 사이를 이동할 때는 페이지 전체를 새로 불러온다. 두 Router가 공유하지 않기 때문이다.

**빌드 표가 둘로 나뉜다**: `Route (app)`과 `Route (pages)`가 따로 나온다.
- 공통 JS도 app은 87.4 kB, pages는 95.2 kB로 따로 계산된다.
- `/gallery`의 First Load JS는 107 kB로 pages 때(102 kB)보다 크다. 아직 app 쪽은 페이지가 하나뿐이라 공통 chunk를 나눠 쓸 페이지가 없기 때문으로 보인다. 다 옮긴 뒤 다시 비교한다.

#### ✅ 실제로 해 보니 (2026-11-19) 3. `/client`

- `app/client/page.tsx`: 서버 컴포넌트. `metadata`만 정하고 `ClientView`를 그린다.
- `app/client/ClientView.tsx`: `'use client'`. `pages/client.tsx`의 `useState`, `useEffect`, `dynamic(ssr: false)`를 그대로 옮겼다.
- page에 `'use client'`를 붙이면 `metadata`를 export할 수 없어서 둘로 나눴다. `/gallery`의 `Hero`와 같은 방식이다.

**`'use client'`도 첫 HTML은 서버에서 그린다**
- 서버 HTML에 `서버 시각: 불러오는 중...`과 `fetch 호출 횟수: 0`이 들어 있다.
- 그래서 `window`를 쓰는 `WindowSize`는 App Router에서도 `dynamic(..., { ssr: false })`가 필요하다.

**App Router의 `ssr: false`는 Suspense로 구현돼 있다**
```html
<!--$!--><template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING"></template><p>창 크기 계산 중...</p><!--/$-->
```
- "이 부분은 서버에서 그리지 않고 브라우저에 맡긴다"는 표시다. Pages Router에서는 로딩 문구만 그대로 들어갔다.

**StrictMode**
- App Router는 Next 13.4부터 StrictMode가 기본으로 켜져 있다.
- 이 프로젝트는 `next.config.js`에 `reactStrictMode: false`를 적어 두었고, dev에서 fetch 호출 횟수는 **1**이었다. 설정에 직접 적은 값이 app에도 적용된다.

**결과**
- smoke 12/12. 서버 시각, 창 크기, fetch 횟수 모두 정상이다.
- `/client`의 First Load JS: 100 kB(pages) → **88.8 kB**(app)

#### ✅ 실제로 해 보니 (2026-11-19) 4. `/` (홈)

- `app/page.tsx`: 서버 컴포넌트. `getStaticProps` 없이 `getAllPosts()`와 `new Date()`를 함수 안에서 바로 호출한다.
- `app/List.tsx`: styled `ul` (`'use client'`)
- 이제 smoke의 `styled-components SSR` 검사(`/`의 `data-styled`)가 app 쪽 registry를 검증한다. 통과했다.

**`getStaticProps` 없이도 SSG다**
- 빌드 표에 `/`가 `○ (Static)`으로 나온다.
- 프로덕션에서 두 번 요청해도 "정적 생성 시각"이 같았다(`2026-11-18T16:32:54.243Z`).
- `headers()`나 `cookies()` 같은 동적 함수를 쓰지 않으면 기본으로 정적 페이지가 된다. API(Route Handler)와 같은 규칙이다.
- dev에서는 요청마다 렌더링해서 새로고침할 때마다 값이 바뀐다.

**함정: `title.template`은 같은 폴더의 page에는 적용되지 않는다**
- `app/layout.tsx`의 template(`%s | next-10-to-14`)은 **자식 폴더**의 page에만 적용된다.
- `app/page.tsx`는 layout과 같은 폴더라서 `title: '홈'`이라고 쓰면 제목이 `홈` 하나로만 나왔다. `/gallery`는 `app/gallery/` 안이라서 적용됐다.
- 홈만 `'홈 | next-10-to-14'`로 전체 제목을 직접 적었다.
- smoke는 제목을 검사하지 않아서 이번에도 못 잡았다. `curl`로 `<title>`을 직접 확인했다.

**RSC payload**
- 서버 HTML 아래쪽 `<script>`(`self.__next_f.push`) 안에 `"href":"/posts/1","children":"Next 10 시작하기"` 같은 내용이 한 번 더 들어 있다.
- 서버 컴포넌트의 결과를 브라우저의 React에 전달하는 데이터다. Pages Router의 `__NEXT_DATA__`(props)와 비슷한 역할이다.

**번들: 홈은 오히려 커졌다**
- `/`의 First Load JS: 102 kB(pages) → **116 kB**(app)
- `/client`는 줄었는데 홈은 늘었다. `Image`, `Link`, styled 컴포넌트 같은 클라이언트 컴포넌트가 App Router 런타임에 추가된 것으로 보인다. 원인은 아직 확인하지 않았다. 다 옮긴 뒤 `@next/bundle-analyzer`로 본다.

**결과**: smoke 12/12. dev에서 스타일, 로고, 제목 모두 예전과 같다.

#### ✅ 실제로 해 보니 (2026-11-19) 5. `/posts/[id]`

| Pages Router | App Router |
|---|---|
| `getStaticPaths`의 `paths: [첫 글]` | `generateStaticParams()` → `[{ id: '1' }]` |
| `fallback: true` | `dynamicParams = true` (기본값이지만 비교하려고 적어 둠) |
| `revalidate: 60` | `export const revalidate = 60` |
| `notFound: true` 반환 | `notFound()` 호출 |
| `<Layout title={post.title}>` | `generateMetadata()` |
| `router.isFallback`일 때 "로딩 중..." | 없앰 (아래 실험 참고) |

**결과: `/posts/999`가 드디어 404를 응답한다** ("버전마다 관찰할 것"의 답)

| 요청 | Pages Router (10 ~ 14) | App Router |
|---|---|---|
| `/posts/1` (빌드할 때 생성) | 200 | 200 |
| `/posts/2` (요청이 오면 생성) | 200, 처음엔 "로딩 중" 화면 | 200, 처음부터 글 내용 |
| `/posts/999` (없는 글) | 200 + "로딩 중" → 브라우저에서 404 | **404** |

- App Router의 `dynamicParams`는 Pages Router의 `fallback: 'blocking'`처럼 동작한다. 처음 요청이 오면 서버가 다 만든 다음에 응답한다. 그래서 서버가 404를 판단할 수 있다.
- **404 결과도 캐시된다.**
  - `.next/server/app/posts/`에 `999.html`이 생기고, `999.meta`에 `"status":404`가 저장됐다.
  - `revalidate = 60`이라서, 나중에 999번 글이 생기면 60초가 지난 뒤 다시 만든다.

**실험: `loading.tsx`를 넣으면 다시 200이 된다**
- 예전의 "로딩 중" 화면을 살리려고 `app/posts/[id]/loading.tsx`를 넣고 빌드했다.
  ```
  /posts/999 → 200
  <main><!--$!--><template data-dgst="NEXT_NOT_FOUND"></template><p>로딩 중...</p><!--/$--></main>
  ```
- `loading.tsx`가 있으면 page가 Suspense로 감싸진다. 서버는 로딩 화면부터 보내기 시작하는데, 상태 코드는 응답을 처음 보낼 때 이미 200으로 정해진다.
- 그 뒤에 `notFound()`가 나와도 상태 코드를 바꿀 수 없다. 그래서 브라우저에서 404 화면으로 바꾸는 표시(`NEXT_NOT_FOUND`)만 남는다.
- 이 페이지는 기다릴 데이터가 없어서 `loading.tsx`를 쓰지 않았다. **`fallback: true`와 같은 문제가 `loading.tsx`로 다시 생길 수 있다**는 점을 기억해 둔다.
- smoke는 `/posts/999`를 검사하지 않아서 이 차이를 못 잡는다.

**그 밖에**
- 빌드된 `/posts/1` HTML에 "페이지를 찾을 수 없습니다"가 들어 있지만, 화면에 보이는 부분이 아니라 RSC payload에 들어 있는 `not-found` 화면이다. 브라우저에서 이동하다 404가 나면 바로 보여 주려는 용도다.
- App Router 빌드 표에는 `(ISR: 60 Seconds)` 표시가 없다. 기호만 `●`다.
- `/`와 `/posts/*`가 둘 다 app이라서 이제 전체 새로고침 없이 이동한다.

**결과**: smoke 12/12, `/posts/999` → 404

---

## 공식 문서

- [Version 11](https://nextjs.org/docs/pages/guides/upgrading/version-11) · [12](https://nextjs.org/docs/pages/guides/upgrading/version-12) · [13](https://nextjs.org/docs/pages/guides/upgrading/version-13) · [14](https://nextjs.org/docs/pages/guides/upgrading/version-14)
- [Codemods](https://nextjs.org/docs/app/guides/upgrading/codemods)
- [Pages → App Router 마이그레이션](https://nextjs.org/docs/app/guides/migrating/app-router-migration)
