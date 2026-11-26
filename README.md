# 🧪 dev-lab

프론트엔드 · 백엔드 · 데이터 · 빌드 도구 등을 직접 실험하고 공부하는 개인 실험실입니다.
각 폴더는 **독립적으로 실행**되며, 폴더마다 README에 목적과 결과, 배운 점을 기록합니다.

- 끝난 실험은 아래 **실험 목록**에 있습니다.
- 진행 중이거나 앞으로 할 주제는 [🗺️ ROADMAP.md](./ROADMAP.md)에 있습니다.

## 📝 실험 목록

| 기간 | 분류 | 실험 | 한 줄 요약 |
| --- | --- | --- | --- |
| 2026-11-19 ~ 11-23 | build-tools | [pnpm-turborepo-vitest](./build-tools/pnpm-turborepo-vitest) | pnpm + Turborepo 모노레포, Vitest·Testing Library 테스트, GitHub Actions 품질 게이트 |
| 2026-10-26 ~ 11-19 | frontend | [next-10-to-14](./frontend/next-10-to-14) | Next 10 → 14 버전업 (Pages 유지 → App Router 이전) |

**바로 가기**

- [pnpm-turborepo-vitest 실험](./build-tools/pnpm-turborepo-vitest): workspace 연결, turbo 캐시 측정, 테스트 21개, 머지가 막히는 CI
- [next-10-to-14 실험](./frontend/next-10-to-14): Next 10 → 14에서 실제로 깨지는 지점, Node·React·TypeScript를 올리는 순서, Pages Router → App Router 이전

## 📂 구조

| 경로 | 설명 |
| --- | --- |
| [`frontend/`](./frontend) | React, Next.js, 렌더링, 성능 최적화 등 |
| [`build-tools/`](./build-tools) | Vite, Babel, Webpack, 모노레포 등 빌드 도구 |
| [`backend/`](./backend) | 서버, API, DB 등 |
| [`data/`](./data) | 데이터 처리 · 분석 |
| [`algorithm/`](./algorithm) | 자료구조 · 알고리즘 패턴 |
| [`_template/`](./_template) | 실험 README 틀 |
| [`docs/superpowers/`](./docs/superpowers) | 실험마다 시작 전에 쓴 설계 문서(`specs/`)와 실행 계획(`plans/`) |
| [`.github/workflows/`](./.github/workflows) | CI가 필요한 실험의 워크플로 (`<실험 이름>.yml`) |

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

## ➕ 새 실험 추가하기

1. [ROADMAP.md](./ROADMAP.md)에서 할 주제를 「🚧 진행 중」으로 옮깁니다.
2. 브랜치를 만들고 템플릿을 복사합니다. main은 PR로만 머지할 수 있습니다.

   ```bash
   git switch -c feature/<분류>/<실험 이름>-01
   cp -r _template frontend/debounce-vue
   ```

3. 폴더의 README를 채웁니다. ✍️ 표시는 직접 작성하는 칸입니다.
4. 끝나면 PR을 머지하고, 위 **실험 목록**에 한 줄, **바로 가기**에 한 줄을 추가합니다. ROADMAP에서는 「✅ 끝남」으로 옮깁니다.
