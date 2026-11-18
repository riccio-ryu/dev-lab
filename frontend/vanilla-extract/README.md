# vanilla-extract

> 📅 YYYY-MM-DD · 🏷️ vanilla-extract, zero-runtime CSS-in-JS, 테마 계약, recipes, sprinkles

## 🎯 목적 / 질문
- 런타임 CSS-in-JS(styled-components)와 zero-runtime(vanilla-extract)은 빌드 결과와 런타임에서 무엇이 다른가?
- `.css.ts`로 쓴 스타일은 어디로 가나? (빌드 후 CSS 파일·클래스 이름 확인)
- 테마 계약(`createThemeContract`)으로 토큰을 타입 안전하게 쓰면 무엇이 좋아지나?
- variant는 `recipes`로, 유틸 클래스는 `sprinkles`로 어떻게 만드나?
- 런타임 값(사용자 색상 등)은 어떻게 넣나? (`assignInlineVars`)

> 당근 모임팀 기술 스택. `frontend/next-10-to-14`에서 쓰는 styled-components와 비교한다.

## 🛠️ 환경
- Node 20.x / React 18 / Vite + `@vanilla-extract/vite-plugin` / TypeScript

## ▶️ 실행 방법
```bash
npm install
npm run dev
npm run build    # dist/assets의 CSS 파일 확인
```

## 🧭 단계 (Claude가 뼈대 준비 · ✍️는 직접)
1. 버튼 컴포넌트를 styled-components로 하나, vanilla-extract로 하나 만들기 ✍️
2. 빌드 후 두 방식의 **JS 번들 크기와 CSS 파일** 비교, 런타임에 `<style>` 태그가 생기는지 확인 ✍️
3. `createThemeContract` + 라이트/다크 테마, 없는 토큰을 쓰면 타입 에러가 나는지 확인 ✍️
4. `recipe`로 size·tone variant 만들기 (디자인 시스템 버튼) ✍️
5. `assignInlineVars`로 런타임 색상 넣기 ✍️
6. (선택) 스트리밍 SSR 실험에 붙여 SSR에서 별도 설정이 필요 없는지 확인 ✍️

## 🔬 해본 것 ✍️
1.

## ✅ 결과 & 배운 점 ✍️
-

## 🎤 면접 연결
- 당근 대비 ③-2 #19, #20
- ③-1 #48 선택자 우선순위

## 🔗 참고 링크
- https://vanilla-extract.style/documentation/getting-started/
- https://vanilla-extract.style/documentation/theming/
- https://vanilla-extract.style/documentation/packages/recipes/
- https://vanilla-extract.style/documentation/packages/sprinkles/
