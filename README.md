# 🧪 dev-lab

프론트엔드 · 백엔드 · 데이터 · 빌드 도구 등을 직접 실험하고 공부하는 개인 실험실입니다.
각 폴더는 **독립적으로 실행**되며, 폴더마다 README에 목적과 결과, 배운 점을 기록합니다.

## 📂 구조

| 분류 | 설명 |
| --- | --- |
| [`frontend/`](./frontend) | React, Next.js, 렌더링, 성능 최적화 등 |
| [`build-tools/`](./build-tools) | Vite, Babel, Webpack 등 번들러 · 트랜스파일러 |
| [`backend/`](./backend) | 서버, API, DB 등 |
| [`data/`](./data) | 데이터 처리 · 분석 |
| [`algorithm/`](./algorithm) | 자료구조 · 알고리즘 패턴 |

### 폴더 이름 규칙

**공부할 것 하나 = 폴더 하나.** 이름은 `주제[-변형]` 형식의 소문자 kebab-case로 짓습니다.
같은 주제라도 버전이나 프레임워크가 다르면 폴더를 따로 만듭니다.

```
frontend/
├── next-10-to-14/       Next 버전업 (출발 → 도착 버전)
├── next-10-to-15/
├── next-11-to-14/
├── debounce/            기본은 바닐라 JS 또는 React
├── debounce-vue/        프레임워크가 다르면 접미사
└── intersection-observer/
backend/
└── websocket/
algorithm/
└── prefix-sum/
```

## 📝 실험 목록

| 날짜 | 분류 | 실험 | 한 줄 요약 |
| --- | --- | --- | --- |
| 2026-10-26 | frontend | [next-10-to-14](./frontend/next-10-to-14) | Next 10 → 14 버전업 (Pages 유지 → App Router 이전) |

## ➕ 새 실험 추가하기

```bash
cp -r _template frontend/debounce-vue
```

그다음 해당 폴더의 README를 채우고(✍️ 표시는 직접 작성하는 칸), 위 **실험 목록**에 한 줄을 추가합니다.
