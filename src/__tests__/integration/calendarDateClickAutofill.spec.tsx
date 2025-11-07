import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { render, screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SnackbarProvider } from 'notistack';
import { ReactElement } from 'react';
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';

import { setupMockHandlerCreation } from '../../__mocks__/handlersUtils';
import App from '../../App';

const theme = createTheme();

const setup = (element: ReactElement) => {
  const user = userEvent.setup();

  return {
    ...render(
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>{element}</SnackbarProvider>
      </ThemeProvider>
    ),
    user,
  };
};

describe('캘린더 날짜 클릭 시 폼 자동 완성', () => {
  const FIXED_TIME = '2025-10-01T09:00:00';

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(FIXED_TIME));
    setupMockHandlerCreation();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('월간 캘린더 날짜를 클릭하면 폼에 선택한 날짜와 기본 시간대가 반영된다', async () => {
    const { user } = setup(<App />);

    await screen.findByText('일정 로딩 완료!');

    const monthView = within(await screen.findByTestId('month-view'));

    const targetDay = monthView.getAllByText('15')[0];
    await user.click(targetDay);

    const dateInput = screen.getByLabelText('날짜') as HTMLInputElement;
    const startTimeInput = screen.getByLabelText('시작 시간') as HTMLInputElement;
    const endTimeInput = screen.getByLabelText('종료 시간') as HTMLInputElement;

    expect(dateInput).toHaveValue('2025-10-15');
    expect(startTimeInput).toHaveValue('09:00');
    expect(endTimeInput).toHaveValue('10:00');
  });
});
