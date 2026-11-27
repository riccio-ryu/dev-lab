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

## 🔬 해본 것 ✍️

1.

## ✅ 결과 & 배운 점 ✍️

-

## 🔗 참고 링크

- [Jest: Getting Started (Babel, TypeScript)](https://jestjs.io/docs/getting-started)
- [Jest: Mock Functions](https://jestjs.io/docs/mock-function-api)
- [Jest: moduleNameMapper](https://jestjs.io/docs/configuration#modulenamemapper-objectstring-string--arraystring)
- [Testing Library: Jest 설정](https://testing-library.com/docs/react-testing-library/setup)
