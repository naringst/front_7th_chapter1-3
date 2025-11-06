# Storybook + Chromatic 시각적 회귀 테스트 가이드

## 설치 순서

⚠️ **중요**: Storybook이 설치되어 있지 않다면, 반드시 **Storybook을 먼저 초기화**한 후 Chromatic addon을 추가해야 합니다.

### 빠른 참조: 필수 설치 순서

```bash
# 1단계: Storybook 초기화 (필수!)
pnpm dlx storybook@latest init

# 2단계: Storybook이 정상 작동하는지 확인
pnpm storybook
# 브라우저에서 http://localhost:6006 열어서 확인 후 종료

# 3단계: Chromatic addon 추가 (Storybook 초기화 후에만 가능!)
pnpm dlx storybook@latest add @chromatic-com/storybook
```

**왜 이 순서인가?**

- `pnpm dlx storybook@latest add` 명령어는 기존 Storybook 설정 파일(`.storybook/main.ts`)을 찾아서 수정합니다
- Storybook이 초기화되지 않으면 설정 파일이 없어서 오류가 발생합니다

### Storybook이 이미 설치되어 있는지 확인

프로젝트에 `.storybook` 디렉토리와 `package.json`에 storybook 관련 패키지가 있는지 확인하세요.

## 1. Storybook 초기화 (필수 - 처음 설치 시)

**Storybook이 설치되어 있지 않다면** 먼저 초기화합니다:

```bash
# npx 사용 (npm/yarn 사용 시)
npx storybook@latest init

# 또는 pnpm dlx 사용 (pnpm 사용 시 - 권장)
pnpm dlx storybook@latest init
```

이 명령어는:

- 필요한 Storybook 패키지들을 자동으로 설치
- `.storybook/main.ts` 설정 파일 생성
- `.storybook/preview.ts` 설정 파일 생성
- `package.json`에 storybook 스크립트 추가

**참고**: `pnpm dlx`는 pnpm의 `npx`와 동일한 역할을 합니다. pnpm을 사용하는 프로젝트에서는 `pnpm dlx`를 사용하는 것이 일관성 있습니다.

초기화가 완료되면 `pnpm storybook` 명령어로 Storybook이 정상 작동하는지 확인하세요.

## 2. Chromatic 통합 패키지 설치

**Storybook 초기화가 완료된 후**, 공식 문서 권장 방법으로 Chromatic 통합을 설치합니다:

```bash
pnpm dlx storybook@latest add @chromatic-com/storybook
```

이 명령어는:

- `@chromatic-com/storybook` 패키지를 설치
- `.storybook/main.ts`에 자동으로 addon 추가
- 필요한 설정을 자동으로 구성

**참고**: Storybook이 설치되어 있지 않은 상태에서 이 명령어를 실행하면 오류가 발생합니다.

### 추가로 필요한 패키지 (수동 설치가 필요한 경우)

```bash
pnpm add -D chromatic @storybook/test
```

- `chromatic`: Chromatic CLI (시각적 회귀 테스트 실행)
- `@storybook/test`: Storybook 테스트 유틸리티 (인터랙션 테스트용)

또는 수동으로 설정:

### `.storybook/main.ts` 생성

```typescript
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@chromatic-com/storybook', // Chromatic 통합
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
};

export default config;
```

### `.storybook/preview.ts` 생성

```typescript
import type { Preview } from '@storybook/react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';

// MUI 테마 설정
const theme = createTheme();

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    // Chromatic 설정
    chromatic: {
      viewports: [320, 768, 1024, 1280], // 테스트할 뷰포트 크기
      delay: 1000, // 스토리 렌더링 후 대기 시간 (ms)
      diffThreshold: 0.2, // 차이 허용 임계값
    },
  },
  decorators: [
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>
          <Story />
        </SnackbarProvider>
      </ThemeProvider>
    ),
  ],
};

export default preview;
```

## 3. Story 파일 작성 예제

### `src/components/RecurringEventDialog.stories.tsx`

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { fn } from '@storybook/test';
import RecurringEventDialog from './RecurringEventDialog';
import { Event } from '../types';

const meta: Meta<typeof RecurringEventDialog> = {
  title: 'Components/RecurringEventDialog',
  component: RecurringEventDialog,
  parameters: {
    layout: 'centered',
    // Chromatic에서 이 스토리를 시각적 회귀 테스트에 포함
    chromatic: { disableSnapshot: false },
  },
  tags: ['autodocs'],
  argTypes: {
    mode: {
      control: 'select',
      options: ['edit', 'delete'],
    },
    open: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof RecurringEventDialog>;

// 샘플 이벤트 데이터
const sampleEvent: Event = {
  id: 1,
  title: '회의',
  date: '2025-11-06',
  startTime: '10:00',
  endTime: '11:00',
  description: '팀 회의',
  location: '서울',
  category: '업무',
  repeat: {
    type: 'weekly',
    interval: 1,
    endDate: '2025-12-31',
  },
  notificationTime: 60,
};

// 기본 스토리 - 편집 모드
export const EditMode: Story = {
  args: {
    open: true,
    mode: 'edit',
    event: sampleEvent,
    onClose: fn(),
    onConfirm: fn(),
  },
};

// 삭제 모드
export const DeleteMode: Story = {
  args: {
    open: true,
    mode: 'delete',
    event: sampleEvent,
    onClose: fn(),
    onConfirm: fn(),
  },
};

// 닫힌 상태 (open: false)
export const Closed: Story = {
  args: {
    open: false,
    mode: 'edit',
    event: sampleEvent,
    onClose: fn(),
    onConfirm: fn(),
  },
};

// 이벤트가 null인 경우
export const NoEvent: Story = {
  args: {
    open: true,
    mode: 'edit',
    event: null,
    onClose: fn(),
    onConfirm: fn(),
  },
};

// 인터랙션 테스트 포함
export const WithInteractions: Story = {
  args: {
    open: true,
    mode: 'edit',
    event: sampleEvent,
    onClose: fn(),
    onConfirm: fn(),
  },
  play: async ({ canvasElement, args }) => {
    // 인터랙션 테스트는 @storybook/test-play 또는 @storybook/testing-library 사용
    // 예: 버튼 클릭 시뮬레이션 등
  },
};
```

## 4. package.json 스크립트 추가

```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "chromatic": "chromatic --project-token=YOUR_PROJECT_TOKEN"
  }
}
```

## 5. Chromatic 설정

### 5.1 Chromatic 계정 생성 및 프로젝트 생성

1. [chromatic.com](https://www.chromatic.com)에 가입
2. GitHub 저장소 연결
3. 새 프로젝트 생성
4. 프로젝트 토큰 받기

### 5.2 로컬에서 Chromatic 실행

```bash
# 프로젝트 토큰 설정 (한 번만)
npx chromatic --project-token=YOUR_PROJECT_TOKEN

# 또는 환경 변수로 설정
export CHROMATIC_PROJECT_TOKEN=YOUR_PROJECT_TOKEN
npx chromatic
```

### 5.3 CI/CD 통합 (GitHub Actions 예제)

`.github/workflows/visual-testing.yml`:

```yaml
name: Visual Testing

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0 # 전체 히스토리 필요 (변경사항 비교용)

      - uses: pnpm/action-setup@v4
        with:
          version: latest

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Install Playwright Browsers (Chromatic 필요)
        run: pnpm exec playwright install --with-deps

      - name: Publish to Chromatic
        uses: chromaui/action@v1
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          buildScriptName: build-storybook
          # 옵션: 자동 승인 (신뢰하는 PR에 대해)
          # autoAcceptChanges: ${{ github.event.pull_request.user.login == 'trusted-user' }}
```

### 5.4 GitHub Secrets 설정

1. GitHub 저장소 → Settings → Secrets and variables → Actions
2. `CHROMATIC_PROJECT_TOKEN` 추가
3. Chromatic에서 받은 프로젝트 토큰 값 입력

## 6. 시각적 회귀 테스트 작성 가이드

### 6.1 기본 원칙

1. **모든 주요 상태를 Story로 작성**

   - 기본 상태
   - 변형된 상태 (다른 props 조합)
   - 에지 케이스 (null, undefined, 빈 값 등)

2. **Chromatic 파라미터 활용**

   ```typescript
   parameters: {
     chromatic: {
       viewports: [320, 768, 1024], // 반응형 테스트
       delay: 1000, // 애니메이션 대기
       pauseAnimationAtEnd: true, // 애니메이션 끝에서 스크린샷
     },
   }
   ```

3. **인터랙션 테스트 포함**

   ```typescript
   import { within, userEvent } from '@storybook/test';

   export const WithInteraction: Story = {
     play: async ({ canvasElement }) => {
       const canvas = within(canvasElement);
       const button = canvas.getByRole('button', { name: '예' });
       await userEvent.click(button);
       // 클릭 후 상태 확인
     },
   };
   ```

### 6.2 복잡한 컴포넌트 테스트

App 컴포넌트처럼 큰 컴포넌트는 Story로 분리하기 어려울 수 있습니다. 대신:

- 작은 UI 컴포넌트 단위로 Story 작성
- 또는 특정 상태/뷰만 분리하여 Story 작성

예: `EventForm.stories.tsx` (폼만 분리)

```typescript
// App에서 폼 부분만 분리하여 독립적인 컴포넌트로 만들거나
// 또는 App 전체를 Story로 작성하되, 특정 상태만 캡처
```

## 7. 실행 및 테스트

### 7.1 로컬에서 Storybook 실행

```bash
pnpm storybook
```

브라우저에서 `http://localhost:6006` 열기

### 7.2 Chromatic에 퍼블리시

```bash
pnpm chromatic
```

또는:

```bash
pnpm build-storybook
npx chromatic --project-token=YOUR_TOKEN
```

## 8. Chromatic 워크플로우

1. **첫 실행**: 모든 Story를 베이스라인으로 저장
2. **이후 변경**: 변경사항이 있으면 diff 이미지 생성
3. **리뷰**: Chromatic UI에서 변경사항 확인
4. **승인/거부**: 변경사항이 의도된 것이면 승인, 아니면 거부

## 9. 베스트 프랙티스

1. **작은 단위로 테스트**: 큰 페이지보다 작은 컴포넌트 단위
2. **모든 상태 커버**: 모든 props 조합과 상태 테스트
3. **반응형 고려**: 다양한 뷰포트 크기 테스트
4. **의미있는 이름**: Story 이름을 명확하게 작성
5. **정기적 업데이트**: 주요 변경사항마다 Chromatic 실행

## 10. 트러블슈팅

### Storybook이 시작되지 않을 때

- `node_modules` 삭제 후 재설치
- `pnpm install` 재실행

### Chromatic 빌드 실패

- Storybook 빌드가 성공하는지 확인: `pnpm build-storybook`
- 프로젝트 토큰이 올바른지 확인
- 네트워크/프록시 설정 확인

### 시각적 차이 오탐

- `chromatic.diffThreshold` 조정
- `chromatic.delay` 증가 (느린 렌더링 대응)
- 플랫폼별 차이 고려 (macOS vs Linux)

## 참고 자료

- [Storybook 공식 문서](https://storybook.js.org/)
- [Chromatic 문서](https://www.chromatic.com/docs)
- [Storybook + Vite 가이드](https://storybook.js.org/docs/get-started/vite)
