# Jest

> 📅 2026-11-27 · 🏷️ Jest, babel-jest, Testing Library, jest.mock

## 🎯 목적 / 질문

[pnpm-turborepo-vitest](../../build-tools/pnpm-turborepo-vitest)에서 Vitest로 쓴 테스트를 Jest로 옮겨 돌려 본다.

- Vitest와 비교해 설정이 왜 더 필요한가? (TS·JSX 변환, CSS import, ESM)
- `jest.fn()`, `jest.mock()`, `jest.spyOn()`은 각각 언제 쓰나?
- 같은 테스트를 돌리면 속도는 얼마나 다른가?

## 🛠️ 환경

|            | 버전                      |
| ---------- | ------------------------- |
| Node       | 24.15.0 (`.nvmrc`)        |
| Jest       | 30.x (`jsdom` 환경)       |
| Babel      | 7.x (`babel-jest`가 변환) |
| React      | 19.x                      |
| TypeScript | 5.9 (타입 검사만)         |

## ▶️ 실행 방법

```bash
nvm use
npm install
npm test              # jest
npm run typecheck     # tsc --noEmit (Babel은 타입을 검사하지 않는다)
```

## 📁 구성

```
jest/
├── babel.config.js     # TS·JSX → JS 변환 (babel-jest가 읽는다)
├── jest.config.js      # jsdom 환경, setup 파일, CSS Modules 처리
├── jest.setup.ts       # jest-dom 매처(toBeInTheDocument 등) 등록
└── src/
    ├── price.ts                # 9-2에서 복사 (formatPrice, discountedPrice)
    ├── Button.tsx              # 9-2에서 복사
    ├── QuantitySelector.tsx    # 9-2에서 복사
    ├── api.ts                  # fetchStock: 서버에 재고를 묻는다 (테스트에서 mock)
    └── stock.ts                # canAddToCart: 재고보다 많이 담을 수 있는지
```

복사한 파일은 9-2와 같은 코드다. 이 폴더는 모노레포와 따로 돌아가야 해서 import하지 않고 복사했다.

**Vitest 설정과 비교** (9-2 `packages/ui`)

| 항목                   | Vitest                                      | Jest (이 폴더)                                            |
| ---------------------- | ------------------------------------------- | --------------------------------------------------------- |
| TS·JSX 변환            | Vite가 기본으로 처리                        | `babel-jest` + `babel.config.js` 필요                     |
| CSS Modules import     | Vite가 기본으로 처리                        | `moduleNameMapper`로 `identity-obj-proxy`에 연결          |
| `describe`·`it` 등     | `import { ... } from 'vitest'` (globals 끔) | 전역으로 제공, import 없음                                |
| 테스트마다 화면 비우기 | `afterEach(cleanup)` 직접 등록              | Testing Library가 자동으로 함 (전역 `afterEach`가 있어서) |
| 가짜 함수              | `vi.fn()`                                   | `jest.fn()`                                               |

## 🔬 해본 것

1. 빈 폴더에 Jest 30, `jest-environment-jsdom`, `babel-jest`를 설치하고, Babel·Jest·TypeScript 설정을 붙였다.
   - Babel 8을 먼저 설치했더니 `npm ls`에 invalid peer가 떴다. Jest 30이 안에서 쓰는 Babel 플러그인이 아직 7만 지원해서 Babel 7로 내렸다.
2. 9-2의 `price.test.ts`(10개)와 `QuantitySelector.test.tsx`(6개)를 옮겼다.
   - `from 'vitest'` import 줄을 지우고, `vi.fn()`을 `jest.fn()`으로 바꿨다. 나머지는 그대로 통과했다.
   - Vitest 때 직접 넣었던 `afterEach(cleanup)` 없이도 통과했다.
3. 재고 API(`api.ts`의 `fetchStock`)를 `jest.mock('./api')`로 통째로 가짜로 바꾸고, `canAddToCart` 테스트 3개를 새로 썼다.
   - 테스트마다 `mockResolvedValueOnce(3)`로 돌려줄 재고를 정했다.
4. `toHaveBeenCalledTimes(1)`을 추가해서, mock 호출 기록이 테스트 사이에 남는 것을 확인하고 `beforeEach(jest.clearAllMocks)`로 고쳤다.
5. `stock.ts`의 `quantity <= stock`을 `<`로 바꿔서, 경계값 테스트(재고 3, 3개 담기)가 실패하는 것을 확인했다.
6. 같은 테스트를 Jest와 Vitest로 세 번씩 돌려 시간을 쟀다.

## ✅ 결과 & 배운 점

**테스트:** 3개 파일, 19개 통과. `npm run typecheck`(tsc)도 통과.

**Vitest에서는 안 하던 설정 3가지**

- **TS·JSX 변환:** Jest는 `.ts`·`.tsx`를 직접 읽지 못한다. `babel-jest`가 테스트 전에 Babel로 바꾼다. Vitest는 Vite가 이 일을 기본으로 한다.
- **Babel은 타입을 검사하지 않는다:** 타입만 지우고 실행한다. 타입이 틀려도 테스트는 통과할 수 있어서 `tsc --noEmit`을 따로 둬야 한다.
- **CSS import:** Jest는 `.module.css`를 import하면 `SyntaxError: Unexpected token '.'`로 멈춘다(`moduleNameMapper`를 비우고 돌려서 확인). `moduleNameMapper`로 `identity-obj-proxy`에 연결하면 `styles.button`이 `'button'` 글자를 돌려준다.

**mock 호출 기록은 테스트 사이에 남는다**

- `jest.mock()`은 파일을 읽을 때 한 번 실행된다. 그래서 테스트 3개가 가짜 함수 하나를 같이 쓰고, 부른 기록(`mock.calls`)이 쌓인다.
- 3번째 테스트에서 `toHaveBeenCalledTimes(1)`은 `Received number of calls: 3`으로 실패했다. `toHaveBeenCalledWith('mouse')`는 기록 중 하나만 맞아도 통과해서, 이것만으로는 문제가 안 보였다.
- `beforeEach(() => jest.clearAllMocks())`로 테스트마다 기록을 비우니 통과했다. `jest.config.js`에 `clearMocks: true`를 넣어도 같다.
- 기록이 남으면 테스트를 따로 돌릴 때와 같이 돌릴 때 결과가 달라진다.

| 함수                     | 지우는 것                                         |
| ------------------------ | ------------------------------------------------- |
| `jest.clearAllMocks()`   | 호출 기록만                                       |
| `jest.resetAllMocks()`   | 호출 기록 + `mockResolvedValue` 같은 설정         |
| `jest.restoreAllMocks()` | `jest.spyOn`으로 바꾼 함수를 진짜 함수로 되돌린다 |

**속도** (로컬, 같은 날 세 번씩, 명령을 친 뒤 끝날 때까지)

| 도구                    | 실행한 것                             | 1회   | 2회   | 3회   |
| ----------------------- | ------------------------------------- | ----- | ----- | ----- |
| Jest                    | 19개 (한 번에, 전부 jsdom)            | 5.88s | 3.80s | 3.38s |
| Vitest (9-2 utils + ui) | 16개 (utils는 node, ui는 jsdom, 따로) | 2.80s | 2.06s | 2.07s |

- 세 번 모두 Vitest가 빨랐다. 2·3회 기준으로 1.3~1.7초 차이다.
- 정확히 같은 조건은 아니다. Jest는 `stock` 테스트 3개가 더 있고, 순수 함수 테스트도 jsdom에서 돌았다.

## 🔗 참고 링크

- [Jest: Getting Started (Babel, TypeScript)](https://jestjs.io/docs/getting-started)
- [Jest: Mock Functions](https://jestjs.io/docs/mock-function-api)
- [Jest: moduleNameMapper](https://jestjs.io/docs/configuration#modulenamemapper-objectstring-string--arraystring)
- [Testing Library: Jest 설정](https://testing-library.com/docs/react-testing-library/setup)
