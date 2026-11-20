# pnpm + Turborepo + Vitest 모노레포 실험 설계

> 2026-11-19 · 폴더 `build-tools/pnpm-turborepo-vitest/`

## 1. 왜 하나

모노레포, 단위 테스트, CI 품질 게이트를 작은 저장소 하나에서 처음부터 직접 구성해 본다.
- 패키지를 나누고 workspace로 연결한다.
- 테스트를 직접 쓴다.
- 테스트가 깨지면 머지가 막히는 것까지 확인한다.

각 설정을 왜 그렇게 했는지 설명할 수 있는 상태가 목표다.

## 2. 목표 / 하지 않을 것 / 실패로 보는 것

**목표**
- `pnpm install` 한 번이면 앱 1개와 패키지 2개가 연결되고, `pnpm turbo run lint test build`가 통과한다.
- 두 번째 실행은 캐시로 끝난다(`FULL TURBO`). 첫 실행과 두 번째 실행의 시간을 README에 남긴다.
- PR마다 GitHub Actions가 같은 명령을 돌린다. 테스트를 일부러 깨뜨린 PR에서 머지가 막히는 화면을 남긴다.
- 아래 질문에 답할 수 있게 한다.
  - `workspace:*`가 무엇인가.
  - `^build`가 무엇이고 캐시가 왜 빠른가.
  - utils는 빌드하고 ui는 안 한 이유는 무엇인가.
  - 무엇을 단위 테스트했고 무엇은 안 했는가.

**하지 않을 것**
- E2E(Playwright·Cypress), Storybook, 패키지 npm 배포(changesets), 원격 캐시(Vercel Remote Cache).
- 실제 커머스 기능(장바구니 상태 저장, API). 화면은 부품이 연결된 걸 보여 주는 한 페이지면 충분하다.

**나중에 할 것** (9-2 CI가 끝난 뒤, 2026-11-21 사용자 요청)
- 한 모노레포 안에서 Vue와 React를 오가며 써 본다.
- 방식
  - `apps/vue-shop`(Vite + Vue 3)을 추가한다. `@lab/utils`만 `workspace:*`로 가져다 쓴다.
  - `@lab/ui`는 React라서 쓰지 않는다. utils만 빌드하는 이유가 여기서 드러난다.
  - turbo가 utils를 먼저 빌드한 뒤 web과 vue-shop을 동시에 빌드하는지 확인한다.
- 범위: lint와 build만 붙인다. Vue 컴포넌트 테스트는 그때 정한다.

**실패로 보는 것** (돌아가도 실패)
- 테스트 코드를 직접 쓰지 않아서, 왜 그 케이스를 골랐는지 설명하지 못하는 경우.
- 11/24를 넘기는 경우. 넘길 것 같으면 범위를 줄인다(8장 참고).

## 3. 제약

- Node 24.15.0. `.nvmrc`, `package.json`의 `engines`, CI의 Node 버전을 모두 24로 맞춘다.
  - 처음에는 `.nvmrc`를 두지 않기로 했다. 하지만 Task 2 직후 다른 터미널에서 `pnpm: command not found`가 났다(2026-11-21).
  - 원인: 그 터미널은 next-10-to-14 작업 때 `nvm use 20.12.2`로 바꿔 둔 상태였다. `corepack enable pnpm`은 실행할 때 쓰던 Node(24.15.0)의 bin 폴더에만 `pnpm` 링크를 만든다. 그래서 Node 20에는 pnpm이 없었다.
  - 그래서 `.nvmrc`에 `24.15.0`을 적었다. 폴더를 오갈 때 `nvm use`만 치면 맞는 Node로 바뀐다.
- pnpm은 설치하지 않고 corepack으로 켠다. 루트 `package.json`에 `packageManager: "pnpm@<버전>"`을 적는다.
- dev-lab은 공개 저장소이고 아직 워크플로가 없다. 워크플로는 저장소 루트의 `.github/workflows/`에만 둘 수 있다.
- 커밋과 푸시는 사용자가 한다. Claude는 커밋 메시지와 스테이징할 파일만 제안한다.
- 코드 스타일(인계 문서 5장)
  - 사람이 짠 것처럼 쓴다. 함수마다 JSDoc을 달지 않는다. 비자명한 곳에만 `//` 한 줄을 단다.
  - 타입 파일을 따로 빼지 않는다.
  - Prettier 설정은 next-10-to-14와 같게 한다(작은따옴표, 세미콜론 없음, 120자).

## 4. 접근 방식 (검토한 것과 고른 것)

| | A. 소스 그대로 (Just-in-Time) | B. 패키지마다 빌드 (tsup) | **A+B 섞기 ← 선택** |
|---|---|---|---|
| 방식 | 패키지가 `.ts(x)`를 내보내고 Next가 `transpilePackages`로 컴파일 | 패키지가 `dist/`를 만들고 앱은 그걸 씀 | utils는 B, ui는 A |
| 장점 | 설정이 가장 적음 | `^build` 순서와 빌드 캐시가 눈에 보임 | 두 방식을 모두 보여 주고, 왜 나눴는지가 면접 답이 됨 |
| 단점 | 패키지에 build가 없어 캐시 시연이 약함 | ui까지 빌드하면 React·CSS 설정이 늘어남 | 설정이 A보다 조금 많음(반나절 이내) |

**사용자가 고른 것:** A+B 섞기 (2026-11-19).

**왜 이렇게 나눴나**
- utils는 순수 TypeScript라서 tsup으로 빌드하는 비용이 거의 없다. 나중에 Next가 아닌 곳(다른 앱, 서버)에서도 쓸 수 있다는 이야기로 이어진다.
- ui는 React 컴포넌트와 CSS Modules가 함께 있다. 빌드하면 CSS 처리 설정이 따로 필요하다. 같은 저장소의 Next 앱만 쓰므로 소스 그대로 두는 편이 낫다.

## 5. 구조

```
build-tools/pnpm-turborepo-vitest/
├── package.json            # private, packageManager, 스크립트는 turbo 호출만
├── pnpm-workspace.yaml     # apps/*, packages/*
├── turbo.json              # build / lint / test / dev 태스크
├── .prettierrc
├── README.md               # _template 구조, ✍️ 칸은 비워 둠
├── apps/
│   └── web/                # Next App Router
│       ├── app/page.tsx    # 상품 카드 1개: 가격(utils) + 수량 선택기·버튼(ui)
│       ├── next.config.ts  # transpilePackages: ['@lab/ui']
│       └── package.json    # "@lab/ui": "workspace:*", "@lab/utils": "workspace:*"
└── packages/
    ├── utils/              # B: tsup → dist (ESM + d.ts)
    │   ├── src/price.ts    # formatPrice, 할인가 계산 등 커머스 유틸
    │   ├── src/price.test.ts   ✍️ 사용자 작성
    │   ├── tsup.config.ts
    │   └── vitest.config.ts    # environment: node
    └── ui/                 # A: src를 그대로 export
        ├── src/Button.tsx
        ├── src/QuantitySelector.tsx   # -, 숫자, +, min/max
        ├── src/*.module.css
        ├── src/*.test.tsx      ✍️ 사용자 작성
        └── vitest.config.ts    # environment: jsdom, Testing Library
```

- 패키지 이름 범위는 `@lab/`으로 한다(Claude가 정함).
- **turbo.json 태스크**
  - `build`: `dependsOn: ["^build"]`, outputs는 `dist/**`와 `.next/**`(`.next/cache` 제외).
  - `test`: `dependsOn: ["^build"]`. web이 utils의 `dist`를 쓰기 때문이다.
  - `lint`: 의존 없음.
  - `dev`: `cache: false`, `persistent: true`.
- **lint**: ESLint flat config를 각 패키지에 둔다. 공용 설정 패키지(`packages/eslint-config`)는 만들지 않는다(Claude가 정함). 패키지가 3개뿐이라 공용 설정은 과하다. 면접에서는 "규모가 커지면 공용 설정 패키지로 뺀다"고 말할 수 있다.
- **TypeScript**: 5.9대로 고정한다(Claude가 정함). 7.x는 tsup의 d.ts 생성, Next와 함께 쓸 때의 호환이 확인되지 않았다.
- **Next**: 그때 기준 최신 안정판(현재 16.x). 16에서는 `next lint`가 없어져서 web도 `eslint`를 직접 부른다.

## 6. CI

- 파일: 저장소 루트의 `.github/workflows/pnpm-turborepo-vitest.yml`.
- 언제 도나
  - `pull_request`, 그리고 main에 `push`할 때.
  - `paths: ['build-tools/pnpm-turborepo-vitest/**', 그 워크플로 파일]`로 이 실험이 바뀔 때만 돈다.
- 무엇을 하나
  - `defaults.run.working-directory`를 이 폴더로 둔다.
  - checkout → `pnpm/action-setup` → `setup-node`(pnpm 캐시) → `pnpm install --frozen-lockfile` → `pnpm turbo run lint test build`.
- 머지를 막는 건 GitHub 설정에서 main 브랜치 보호 규칙에 이 체크를 필수로 지정해야 한다. **이 설정은 사용자가 직접 한다.** 공개 저장소라 무료다.

## 7. 누가 무엇을

| 항목 | 담당 |
|---|---|
| workspace, turbo.json, tsup, vitest, eslint, next 설정, Actions yml | Claude |
| `price.ts`, `Button`, `QuantitySelector` 본문 (테스트 대상) | Claude가 단순하게 작성. 사용자가 읽고 고쳐도 됨 |
| 모든 `*.test.ts(x)` | ✍️ 사용자. Claude는 무엇을 테스트할지 목록과 API 사용법만 안내 |
| README 「해본 것」「결과 & 배운 점」 | ✍️ 사용자 |
| README 나머지(목적, 환경, 실행 방법, 구조) | Claude |
| 브랜치 보호 규칙, 커밋, 푸시, 깨뜨린 PR 만들기 | 사용자 |

## 8. 순서와 마감

1. **9-1 뼈대 (11/20)**
   - workspace 구성 → utils(tsup) → ui → web 연결.
   - `pnpm turbo run build`를 두 번 돌려 시간을 잰다.
   - 이 단계에서는 test 태스크에 빈 테스트도 두지 않는다. 9-2에서 붙인다.
2. **9-2 테스트 (11/21~22)**
   - vitest 설정 → 사용자가 utils 테스트를 쓴다 → ui 테스트를 쓴다.
3. **9-2 CI (11/23)**
   - 워크플로 작성 → PR → 브랜치 보호 → 일부러 깨뜨린 PR로 머지가 막히는지 확인.
4. **README 결과 정리 (11/24)**

**밀릴 때 줄이는 순서**
1. ui 테스트를 1개로 줄인다.
2. utils를 A로 되돌린다(tsup 제거).
3. 브랜치 보호 대신 CI 빨간불 캡처만 남긴다.

## 9. 만들면서 정할 것 (빌더 몫)

- 정확한 패키지 버전. 설치할 때의 최신 안정판을 쓰되, 서로 맞지 않으면 한 단계 낮춘다.
- `price.ts`에 넣을 함수 개수: 2~3개.
- `QuantitySelector`의 props 이름.
- web 페이지의 모양.
