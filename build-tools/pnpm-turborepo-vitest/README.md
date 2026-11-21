# pnpm + Turborepo + Vitest 모노레포

> 📅 2026-11-19 · 🏷️ pnpm workspace, Turborepo, Vitest, Testing Library, GitHub Actions

## 🎯 목적 / 질문

모노레포, 단위 테스트, CI 품질 게이트를 작은 저장소 하나에서 처음부터 직접 구성해 본다.

- `workspace:*`는 무엇이고, 패키지끼리 어떻게 연결되는가?
- `^build`는 무엇이고, turbo 캐시는 왜 빠른가?
- utils는 빌드하고 ui는 소스 그대로 둔 이유는?
- 무엇을 단위 테스트했고, 무엇은 안 했는가?

## 🛠️ 환경

|            | 버전                                 |
| ---------- | ------------------------------------ |
| Node       | 24.15.0 (`.nvmrc`)                   |
| pnpm       | 12.21.0 (corepack, `packageManager`) |
| Turborepo  | 2.x                                  |
| Next       | 16.x (App Router)                    |
| React      | 19.x                                 |
| TypeScript | 5.9                                  |

## ▶️ 실행 방법

```bash
nvm use                # .nvmrc → 24.15.0
corepack enable pnpm   # packageManager에 적힌 pnpm 버전을 받아서 쓴다
pnpm install

pnpm dev               # http://localhost:3000
pnpm turbo run lint test build
```

> corepack은 실행할 때 쓰던 Node의 bin 폴더에만 `pnpm` 링크를 만든다. 다른 Node 버전으로 바꾼 터미널에서는 `pnpm: command not found`가 난다. 먼저 `nvm use`를 실행한다.

## 📁 구성

```
pnpm-turborepo-vitest/
├── apps/
│   └── web/          # Next App Router. @lab/ui, @lab/utils를 workspace:*로 쓴다
└── packages/
    ├── utils/        # 가격 유틸. tsup으로 dist를 만든다 (빌드하는 패키지)
    └── ui/           # Button, QuantitySelector. .tsx 소스를 그대로 내보낸다
```

| 패키지       | 내보내는 것                        | 빌드 | 앱에서 쓰는 방법                    |
| ------------ | ---------------------------------- | ---- | ----------------------------------- |
| `@lab/utils` | `dist/index.js`, `dist/index.d.ts` | tsup | 빌드된 JS를 그대로 import           |
| `@lab/ui`    | `src/index.ts`                     | 없음 | Next가 `transpilePackages`로 컴파일 |

**utils만 빌드하는 이유**

- utils는 순수 TypeScript라서 tsup 설정 몇 줄로 빌드할 수 있다. 빌드해 두면 Next가 아닌 곳(다른 앱, 서버)에서도 그대로 쓸 수 있다.
- ui는 React 컴포넌트와 CSS Modules가 섞여 있다. 빌드하려면 CSS 처리 설정이 따로 필요하다. 같은 저장소의 Next 앱만 쓰므로 소스 그대로 두고 Next가 컴파일하게 했다.

**turbo 태스크** (`turbo.json`)

| 태스크  | 의존                                    | 캐시 대상             |
| ------- | --------------------------------------- | --------------------- |
| `build` | `^build` (의존하는 패키지의 build 먼저) | `dist/**`, `.next/**` |
| `test`  | `^build`                                | 없음 (로그만)         |
| `lint`  | 없음                                    | 없음 (로그만)         |
| `dev`   | 없음                                    | 캐시 안 함            |

## 🔬 해본 것 ✍️

1.

<!--
메모: 직접 정리할 재료 (Task 4에서 잰 값, 2026-11-21, `pnpm turbo run lint build`)
- 1회차 (dist·.next·.turbo 모두 지운 상태): 5개 태스크 모두 cache miss → 7.358s
- 2회차 (아무것도 안 바꿈): 5개 모두 cache hit → 14ms, FULL TURBO
- 3회차 (utils/src/price.ts에 주석 한 줄 추가): utils#build, utils#lint, web#build만 cache miss → 3.872s
  - ui#lint, web#lint는 cache hit. lint는 ^ 의존이 없어서 utils가 바뀌어도 다시 돌지 않는다
  - web#build는 ^build라서 utils가 바뀌면 같이 다시 빌드된다
- pnpm 12는 의존성의 설치 스크립트를 기본으로 막는다. esbuild만 allowBuilds로 허용했다
- eslint-config-next의 플러그인이 ESLint 10을 아직 지원하지 않아서 web만 ESLint 9를 쓴다
-->

## ✅ 결과 & 배운 점 ✍️

-

## 🔗 참고 링크

- [pnpm workspace](https://pnpm.io/workspaces)
- [Turborepo: Internal packages](https://turborepo.com/docs/core-concepts/internal-packages)
- [Turborepo: Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Next.js: transpilePackages](https://nextjs.org/docs/app/api-reference/config/next-config-js/transpilePackages)
