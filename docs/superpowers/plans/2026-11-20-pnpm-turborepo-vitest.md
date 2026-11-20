# pnpm + Turborepo + Vitest 모노레포 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `build-tools/pnpm-turborepo-vitest/`에 pnpm workspace와 Turborepo로 모노레포를 만든다. 구성은 앱 1개(`apps/web`)와 패키지 2개(`packages/utils`, `packages/ui`)다. Vitest 단위 테스트를 붙이고, PR마다 `turbo run lint test build`를 돌리는 CI를 만든다.

**Architecture:**
- `packages/utils`는 tsup으로 `dist/`를 만든다(빌드하는 패키지).
- `packages/ui`는 `.tsx` 소스를 그대로 내보낸다. `apps/web`의 Next가 `transpilePackages`로 컴파일한다.
- turbo의 `build`와 `test`는 `^build`에 의존한다. 그래서 utils가 항상 먼저 빌드된다.

**Tech Stack:**
- pnpm(corepack), Turborepo 2.x, Next 16(App Router), React 19, TypeScript 5.9.
- tsup, Vitest, Testing Library, ESLint flat config, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-19-pnpm-turborepo-vitest-design.md`

## Global Constraints

- 모든 경로는 `build-tools/pnpm-turborepo-vitest/` 기준이다(워크플로 파일만 저장소 루트).
- 패키지 이름: 루트 `pnpm-turborepo-vitest`(private), `@lab/web`, `@lab/ui`, `@lab/utils`. 패키지끼리는 `workspace:*`로 의존한다.
- TypeScript는 `~5.9.3`으로 고정한다. 나머지는 설치할 때의 최신 안정판을 쓰고, 서로 맞지 않으면 한 단계 낮춘다.
- Node 24. 루트 `engines.node: ">=24"`. `.nvmrc`는 두지 않는다.
- pnpm은 corepack으로 켠다. 루트에 `packageManager: "pnpm@<설치 시 버전>"`을 적는다.
- Prettier는 `{ "singleQuote": true, "semi": false, "printWidth": 120 }`이다.
- 코드 스타일
  - 함수마다 JSDoc을 달지 않는다. 비자명한 곳에만 `//` 한 줄을 단다.
  - 타입 파일을 따로 빼지 않는다.
  - 값 2~3개짜리 상수 객체를 만들지 않는다.
- **`*.test.ts(x)`는 사용자가 쓴다(✍️).** Claude는 설정, 테스트할 케이스 목록, API 사용법만 준다. README의 「해본 것」「결과 & 배운 점」도 사용자가 쓴다.
- **커밋과 푸시는 사용자가 한다.** 커밋 단계는 Claude가 스테이징할 파일과 메시지를 제안하는 것으로 끝난다.
- 범위 밖: E2E, Storybook, npm 배포, 원격 캐시, 공용 eslint-config 패키지, typecheck 태스크.

## Review Focus

사용자 테스트(✍️)가 놓치기 쉬운 입력 다섯 가지다. 각 태스크의 케이스 목록에 넣어 두었다.

1. `formatPrice`에 `NaN`이나 `Infinity`가 들어오면 "NaN원"을 찍지 말고 `TypeError`를 던진다. (Task 5)
2. `discountedPrice`의 할인율이 0~100 밖이거나 정수가 아니면 `RangeError`를 던진다. 0%와 100%는 경계값으로 통과한다. (Task 5)
3. `QuantitySelector`의 값이 `min`이나 `max`에 닿으면 해당 버튼이 disabled다. disabled 버튼을 눌러도 `onChange`가 불리지 않는다. (Task 6)
4. 처음 clone한 상태(`dist/` 없음)에서 `pnpm turbo run test build`를 돌려도 utils가 먼저 빌드되어 통과한다. (Task 4, Task 7)
5. utils 소스를 한 글자 바꾸면 utils와 web의 build 캐시가 둘 다 무효화된다. 바꾸지 않으면 `FULL TURBO`로 끝난다. (Task 4)

---

## 9-1 모노레포 뼈대

### Task 1: workspace 루트

**Files:**
- Create: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.prettierrc`

**Interfaces:**
- Produces: 루트 스크립트 `build`, `lint`, `test`, `dev`. 각각 `turbo run <같은 이름>`을 호출한다.

- [ ] **Step 1: corepack으로 pnpm 켜기**

Run: `corepack enable pnpm && pnpm -v`
Expected: 버전이 출력된다. 이 버전을 `packageManager`에 적는다.

- [ ] **Step 2: 루트 파일 4개 작성**
- `pnpm-workspace.yaml`: `packages: ['apps/*', 'packages/*']`.
- `turbo.json`(`$schema: https://turbo.build/schema.json`)의 `tasks`는 아래와 같다.
  - `build`: `dependsOn: ["^build"]`, `outputs: ["dist/**", ".next/**", "!.next/cache/**"]`
  - `test`: `dependsOn: ["^build"]`, `outputs: []`
  - `lint`: `outputs: []`
  - `dev`: `cache: false`, `persistent: true`
- 루트 `package.json`의 devDependencies는 `turbo`와 `prettier`다.

- [ ] **Step 3: 설치 확인**

Run: `pnpm install && pnpm turbo run build`
Expected: 설치 성공. turbo는 "No tasks were executed" 같은 메시지로 끝난다. 아직 패키지가 없으니 에러가 아니다.

### Task 2: `packages/utils` (tsup 빌드)

**Files:**
- Create: `packages/utils/package.json`, `tsconfig.json`, `tsup.config.ts`, `eslint.config.mjs`, `src/index.ts`, `src/price.ts`

**Interfaces:**
- Produces(`@lab/utils`)
  - `formatPrice(amount: number): string`
    - 예: `12900` → `'12,900원'`, `-1000` → `'-1,000원'`
    - 소수는 반올림한다.
    - 유한한 수가 아니면 `TypeError`를 던진다.
  - `discountedPrice(price: number, rate: number): number`
    - `rate`는 0~100 사이의 정수(%)다.
    - 결과는 `Math.floor(price * (100 - rate) / 100)`로 1원 단위에서 버린다. 0.9를 곱하는 식으로 계산하면 부동소수점 오차가 생겨서 이렇게 한다.
    - `rate`가 범위 밖이거나 정수가 아니면 `RangeError`를 던진다.
- `package.json`
  - `"type": "module"`
  - `"exports": { ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" } }`
  - scripts: `build: tsup`, `lint: eslint .`

- [ ] **Step 1: 설정 파일 작성**
- `tsup.config.ts`: `entry: ['src/index.ts']`, `format: ['esm']`, `dts: true`, `clean: true`.
- `eslint.config.mjs`: `typescript-eslint`의 `recommended`를 쓰고, `dist/`는 무시한다.

- [ ] **Step 2: `price.ts`에 두 함수 작성, `index.ts`에서 다시 내보내기**

`formatPrice`는 `Math.round(amount).toLocaleString('ko-KR') + '원'`으로 만든다.

- [ ] **Step 3: 빌드와 lint 확인**

Run:
```bash
pnpm --filter @lab/utils build && pnpm --filter @lab/utils lint
node -e "import('./packages/utils/dist/index.js').then(m => console.log(m.formatPrice(m.discountedPrice(12900, 10))))"
```
Expected: `dist/index.js`와 `dist/index.d.ts`가 생기고, lint 에러는 0개다. 마지막 줄은 `11,610원`을 출력한다.

### Task 3: `packages/ui` (소스 그대로)

**Files:**
- Create: `packages/ui/package.json`, `tsconfig.json`, `eslint.config.mjs`, `src/index.ts`, `src/Button.tsx`, `src/Button.module.css`, `src/QuantitySelector.tsx`, `src/QuantitySelector.module.css`

**Interfaces:**
- Produces(`@lab/ui`)
  - `Button(props: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' })`
    - 기본 `variant`는 `'primary'`다.
    - `type`을 주지 않으면 `'button'`이다.
  - `QuantitySelector(props: { value: number; onChange: (next: number) => void; min?: number; max?: number })`
    - 제어 컴포넌트다. 기본값은 `min = 1`, `max = 99`다.
    - 버튼 `aria-label`은 `'수량 줄이기'`와 `'수량 늘리기'`다.
    - 값은 `<span aria-live="polite">`에 보여 준다.
    - `value <= min`이면 줄이기 버튼이, `value >= max`이면 늘리기 버튼이 disabled다.
- `package.json`
  - `"exports": { ".": "./src/index.ts" }`
  - `react`는 peerDependencies에 둔다.
  - scripts는 `lint: eslint .`만 둔다. build 스크립트는 없다.

- [ ] **Step 1: 컴포넌트와 CSS Modules 작성**

`QuantitySelector` 안의 두 버튼은 같은 패키지의 `Button`(`variant="secondary"`)을 쓴다.

- [ ] **Step 2: eslint 설정 작성**

`typescript-eslint`의 `recommended`에 `eslint-plugin-react-hooks`를 더한다.

- [ ] **Step 3: lint 확인**

Run: `pnpm --filter @lab/ui lint`
Expected: 에러 0개.

### Task 4: `apps/web` 연결, 캐시 측정, README 뼈대

**Files:**
- Create: `apps/web/package.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `app/layout.tsx`, `app/page.tsx`, `app/ProductCard.tsx`, `app/page.module.css`
- Create: `README.md`(이 실험 폴더)

**Interfaces:**
- Consumes: Task 2의 `formatPrice`와 `discountedPrice`, Task 3의 `Button`과 `QuantitySelector`.
- `next.config.ts`: `transpilePackages: ['@lab/ui']`. utils는 이미 빌드된 JS라 넣지 않는다. 왜 하나만 넣는지 `//` 한 줄로 적는다.
- `ProductCard`
  - `'use client'`다. `QuantitySelector`에 함수를 넘기므로 클라이언트 컴포넌트여야 한다.
  - 상품 하나를 고정값으로 둔다: 정가 12,900원, 할인율 10%.
  - 정가(취소선), 할인가, 수량, 합계(`formatPrice(discountedPrice(...) * quantity)`)를 보여 준다.
  - "장바구니 담기" `Button`은 `alert`만 띄운다.
- `package.json`
  - dependencies에 `"@lab/ui": "workspace:*"`와 `"@lab/utils": "workspace:*"`를 넣는다.
  - scripts: `build: next build`, `dev: next dev`, `lint: eslint .`
- `eslint.config.mjs`: `eslint-config-next`의 flat config.

- [ ] **Step 1: web 파일 작성 후 설치**

Run: `pnpm install`
Expected: `apps/web/node_modules/@lab/`에 `ui`와 `utils`가 workspace 링크(심볼릭 링크)로 들어간다. `ls -l`로 확인한다.

- [ ] **Step 2: 처음 상태에서 전체 빌드 (Review Focus 4)**

Run:
```bash
rm -rf packages/utils/dist apps/web/.next .turbo
time pnpm turbo run lint build
```
Expected:
- utils#build가 web#build보다 먼저 실행되고, 전체가 통과한다.
- 걸린 시간을 기록한다(1회차).

- [ ] **Step 3: 캐시 확인 (Review Focus 5)**

Run: `time pnpm turbo run lint build`를 실행한다. 그다음 `price.ts`에 주석 한 줄을 넣고 다시 실행한다. 확인이 끝나면 그 주석은 되돌린다.
Expected:
- 2회차는 `FULL TURBO`로 끝나고 1초 안쪽이다.
- 주석을 넣은 뒤에는 utils#build와 web#build가 cache miss이고, ui#lint는 cache hit이다.
- 세 번의 시간을 기록한다.

- [ ] **Step 4: 화면 확인**

Run: `pnpm dev` → `http://localhost:3000`
Expected:
- 수량을 바꾸면 합계가 바뀐다. 1에서는 줄이기 버튼이 비활성화된다.
- 콘솔에 에러가 없다.

- [ ] **Step 5: README 뼈대**

`_template/README.md`의 구조를 따른다.
- Claude가 채운다: 목적/질문(설계 문서 2장의 질문 4개), 환경, 실행 방법(`corepack enable pnpm` 포함), 폴더 구조, utils만 빌드하는 이유.
- 「해본 것 ✍️」과 「결과 & 배운 점 ✍️」은 비워 둔다. Step 2~3에서 잰 시간만 메모로 적어 둔다.

- [ ] **Step 6: 커밋 제안 (사용자가 커밋)**

`build-tools/pnpm-turborepo-vitest/` 전체를 스테이징한다. `pnpm-lock.yaml`도 반드시 넣는다. `.turbo/`, `dist/`, `.next/`는 루트 `.gitignore`에 이미 있다.
메시지 예: `feat(pnpm-turborepo-vitest): pnpm workspace + Turborepo 모노레포 뼈대`

---

## 9-2 단위 테스트

### Task 5: utils 테스트 (✍️ 사용자)

**Files:**
- Create: `packages/utils/vitest.config.ts`
- Modify: `packages/utils/package.json`(devDependency `vitest`, 스크립트 `test: vitest run`)
- Test ✍️: `packages/utils/src/price.test.ts`

- [ ] **Step 1: Claude가 `vitest.config.ts`를 작성한다**

`environment: 'node'`다. `src/**/*.test.ts`만 테스트 파일로 잡는다. tsup의 entry가 `index.ts`라서 테스트 파일은 `dist`에 들어가지 않는다.

- [ ] **Step 2: ✍️ 사용자가 `price.test.ts`를 쓴다.** 케이스 목록:
- `formatPrice`
  - `12900` → `'12,900원'`
  - `0` → `'0원'`
  - `-1000` → `'-1,000원'`
  - `1234.5` → `'1,235원'`
  - `NaN`과 `Infinity` → `TypeError` (Review Focus 1)
- `discountedPrice`
  - `(12900, 10)` → `11610`
  - `(12900, 0)` → `12900`
  - `(12900, 100)` → `0`
  - `(999, 50)` → `499`(버림. 반올림하면 500)
  - `(1000, -1)`, `(1000, 101)`, `(1000, 10.5)` → `RangeError` (Review Focus 2)
- 쓸 API: `describe`, `it`, `expect(...).toBe`, `expect(() => ...).toThrow(TypeError)`

- [ ] **Step 3: 일부러 깨뜨려 보기**

`Math.floor`를 `Math.round`로 바꾸고 `pnpm --filter @lab/utils test`를 돌린다. `(999, 50)` 케이스가 실패하는지 본다. 확인한 뒤 되돌린다.

- [ ] **Step 4: 통과 확인**

Run: `pnpm turbo run test`
Expected: utils#build가 먼저 돌고, utils#test는 전부 PASS다.

### Task 6: ui 테스트 (✍️ 사용자)

**Files:**
- Create: `packages/ui/vitest.config.ts`, `packages/ui/vitest.setup.ts`
- Modify: `packages/ui/package.json`
  - devDependencies: `vitest`, `jsdom`, `@vitejs/plugin-react`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`
  - 스크립트: `test: vitest run`
- Test ✍️: `packages/ui/src/QuantitySelector.test.tsx`, (여유가 있으면) `packages/ui/src/Button.test.tsx`

- [ ] **Step 1: Claude가 설정 파일을 작성한다**
- `vitest.config.ts`: `plugins: [react()]`, `environment: 'jsdom'`, `setupFiles: ['./vitest.setup.ts']`.
- `vitest.setup.ts`: `import '@testing-library/jest-dom/vitest'`.
- CSS Modules는 Vitest가 기본으로 처리하므로 따로 설정하지 않는다.

- [ ] **Step 2: ✍️ 사용자가 `QuantitySelector.test.tsx`를 쓴다.** 케이스 목록:
- 렌더링: `value=3`이면 `3`이 보인다.
- "수량 늘리기"를 누르면 `onChange(4)`가 불린다. "수량 줄이기"를 누르면 `onChange(2)`가 불린다.
- `value=1`(min)이면 줄이기 버튼이 disabled이고, 눌러도 `onChange`가 불리지 않는다. (Review Focus 3)
- `value=99`(max)도 같은 방식으로 확인한다. `max=5`를 따로 줬을 때도 확인한다.
- 쓸 API
  - 요소 찾기: `render`, `screen.getByRole('button', { name: '수량 늘리기' })`
  - 클릭: `userEvent.setup()` → `await user.click(...)`
  - 호출 확인: `vi.fn()`, `toHaveBeenCalledWith`, `not.toHaveBeenCalled`
  - 상태 확인: `toBeDisabled`
- 왜 `getByRole`을 쓰는지 README에 한 줄 남긴다. 사용자가 보는 방식(역할과 이름)으로 찾기 때문이다.

- [ ] **Step 3: 통과 확인**

Run: `pnpm turbo run lint test build`
Expected: 모든 태스크가 통과한다.

- [ ] **Step 4: 커밋 제안 (사용자가 커밋)**

메시지 예: `test(pnpm-turborepo-vitest): utils·ui 단위 테스트 추가`

---

## 9-2 CI 품질 게이트

### Task 7: GitHub Actions와 머지 차단

**Files:**
- Create: 저장소 루트의 `.github/workflows/pnpm-turborepo-vitest.yml`

**Interfaces:**
- 워크플로 이름 `pnpm-turborepo-vitest`, job 이름 `check`. 브랜치 보호 규칙에서 필수 체크로 고를 이름이다.

- [ ] **Step 1: Claude가 워크플로를 작성한다**
- 트리거: `pull_request`, 그리고 `push`(`branches: [main]`)
  - 둘 다 `paths`를 건다: `build-tools/pnpm-turborepo-vitest/**`와 `.github/workflows/pnpm-turborepo-vitest.yml`.
- `defaults.run.working-directory: build-tools/pnpm-turborepo-vitest`
- 단계
  1. `actions/checkout@v4`
  2. `pnpm/action-setup@v4`(`package_json_file: build-tools/pnpm-turborepo-vitest/package.json`)
  3. `actions/setup-node@v4`(`node-version: 24`, `cache: pnpm`, `cache-dependency-path: build-tools/pnpm-turborepo-vitest/pnpm-lock.yaml`)
  4. `pnpm install --frozen-lockfile`
  5. `pnpm turbo run lint test build`
- CI에는 `dist/`도 turbo 캐시도 없다. 그래서 이 실행이 Review Focus 4를 다시 확인하는 셈이다.

- [ ] **Step 2: 사용자가 푸시하고 PR을 연다** → Actions에서 `check`가 초록불인지 확인한다.

- [ ] **Step 3: 사용자가 브랜치 보호 규칙을 켠다**

Settings → Branches(또는 Rulesets) → `main`에서 "Require status checks to pass"를 켜고 `check`를 필수로 고른다.

- [ ] **Step 4: 깨뜨린 PR로 확인한다**

임시 브랜치에서 Task 5 Step 3처럼 `Math.floor`를 `Math.round`로 바꿔 푸시하고 PR을 연다.
Expected: `check`가 빨간불이고 Merge 버튼이 막힌다. 그 화면을 캡처한다. 확인이 끝나면 PR은 닫고 머지하지 않는다.

- [ ] **Step 5: ✍️ README 「해본 것」「결과 & 배운 점」 (사용자)**

재료:
- Task 4에서 잰 시간 세 개.
- 초록불과 빨간불 캡처.
- utils와 ui를 다르게 처리한 이유.
- 테스트에서 고른 케이스와 뺀 것(스타일, Next 페이지 전체).

- [ ] **Step 6: 커밋 제안 (사용자가 커밋)**

메시지 예: `ci(pnpm-turborepo-vitest): PR마다 turbo lint·test·build 실행`
