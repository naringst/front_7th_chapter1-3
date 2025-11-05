import type { Preview } from '@storybook/react-vite';
import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTheme } from '@mui/material/styles';

/**
 * story 렌더링에 필요한 공통 전역 설정
 */

const theme = createTheme();

const preview: Preview = {
  // metadata를 정의해서 story에 다양한 기능을 추가할 때 사용
  // actions: event handler 실행 시 받은 데이터를 story에 표시하는 역할
  parameters: {
    // controls: 개발자가 따로 코드를 변경하지 않고도 storybook에 arguments를 동적으로 바꿔가며 인터렉션 할 수 있게 하는 기능
    // Storybook UI에서 하단 controls 바꾸면 story에 반영되어 바뀌어서 렌더링 됨.
    controls: {
      matchers: {
        // 색이나 날짜는 color picker, date picker로 가능하도록 preview에 설정된 것.
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
    // Chromatic 기본 설정
    chromatic: {
      viewports: [768, 1024, 1280],
      delay: 500,
    },
    // msw: {
    //   handlers,
    // },
  },
  // 주로 스토리 렌더링 할 때 특정 컴포넌트로 감싸거나 sibiling 컴포넌트를 추가하는 설정 할 때 사용
  // 특정 context를 항상 감싸서 스토리를 렌더링 해야 할 때 유용
  // react hook form , react router 사용하면 with Router, withRHF 사용 가능
  // msw에 대한 설정도 storybook에서 하면 좋음 storybook에서는 굳이 실제 api를 스토리를 렌더링할 필요 없음
  // 즉, msw로 api mocking해서 storybook에서 사용하면 좋음
  // 각 컴포넌트 스토리에서 msw 요청을 보낼 때
  decorators: [
    // mswDecorator,
    (Story) => (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Story />
      </ThemeProvider>
    ),
  ],
};

export default preview;
