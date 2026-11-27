# Jest 실험 설계 (11-1)

> 2026-11-27 · 폴더 `frontend/jest/` · 인계 문서 11장

## 왜 하나

Vitest로 테스트를 직접 써 봤지만 Jest는 써 본 적이 없다. 같은 테스트를 Jest로 옮겨서, Jest에서만 필요한 설정과 mock 쓰는 법을 설명할 수 있게 한다.

## 목표 / 하지 않을 것

**목표**
- 9-2의 `price.test.ts`(10개)와 `QuantitySelector.test.tsx`(6개)를 Jest로 옮겨 통과시킨다.
- `jest.mock()`으로 모듈을 통째로 바꾸는 테스트를 하나 이상 쓴다(`stock.ts`가 `api.ts`의 `fetchStock`을 부름).
- 같은 테스트의 실행 시간을 Vitest와 비교해 README에 남긴다.

**하지 않을 것**
- CI, lint, 화면(앱). 모노레포에 넣지 않는다(10장과 같이 주제마다 따로 폴더).

## 정한 것 (Claude)

- **npm + 독립 폴더.** 9-2 소스(`price.ts`, `Button`, `QuantitySelector`, CSS Modules)는 import하지 않고 복사한다.
- **변환은 babel-jest.** ts-jest·@swc/jest도 있지만, 공고에 Babel이 함께 나와서 Babel 설정을 직접 보는 쪽을 골랐다. Babel은 타입을 검사하지 않으므로 `npm run typecheck`(tsc)를 따로 둔다.
- **Babel 7.** Babel 8이 최신이지만 Jest 30이 내부에서 쓰는 Babel 플러그인이 아직 7만 지원한다(`npm ls`에서 invalid peer).
- **`testEnvironment: 'jsdom'`** 하나로 둔다. 순수 함수 테스트도 jsdom에서 돌아간다. 파일마다 바꾸는 방법(`@jest-environment` 주석)은 README에 배운 점으로 남길 수 있다.
- CSS Modules는 `identity-obj-proxy`로 바꾼다.

## 누가 무엇을 (C안)

| 항목 | 담당 |
| --- | --- |
| 설정(babel, jest, tsconfig), 복사한 소스, `api.ts`·`stock.ts`, README 구성·환경·비교 표 | Claude |
| `*.test.ts(x)` 전부, README 「해본 것」「결과 & 배운 점」 | ✍️ 사용자 |
