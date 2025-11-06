import { test, expect, APIRequestContext } from '@playwright/test';

const startUrl = 'http://localhost:5173/';
const apiBaseUrl = 'http://localhost:3000';

// 테스트 데이터 초기화 헬퍼 함수
async function clearEvents(request: APIRequestContext) {
  const response = await request.get(`${apiBaseUrl}/api/events`);
  const { events } = await response.json();
  for (const event of events) {
    await request.delete(`${apiBaseUrl}/api/events/${event.id}`);
  }
}

test.describe.serial('알림 시스템', () => {
  // 고정된 시간: 2025-11-01 10:00:00
  const FIXED_TIME = '2025-11-01T10:00:00';

  test.beforeEach(async ({ page, request }) => {
    // 브라우저 시간을 고정 (페이지 로드 전에 설정)
    await page.clock.setFixedTime(FIXED_TIME);

    // 각 테스트 전에 데이터 초기화
    await clearEvents(request);

    // 페이지를 초기 상태로 설정
    await page.goto(startUrl);
    await page.waitForLoadState('networkidle');
  });

  test('알림 1분 전: 알림이 정상적으로 표시된다', async ({ page, request }) => {
    // 고정된 시간(10:00)에서 1분 후(10:01)에 시작하는 일정 생성
    const fixedDate = new Date(FIXED_TIME);
    const eventTime = new Date(fixedDate.getTime() + 1 * 60 * 1000); // 10:01
    const dateStr = eventTime.toISOString().split('T')[0];
    const timeStr = `${String(eventTime.getHours()).padStart(2, '0')}:${String(
      eventTime.getMinutes()
    ).padStart(2, '0')}`;

    await request.post(`${apiBaseUrl}/api/events`, {
      data: {
        title: '1분 전 알림 일정',
        date: dateStr,
        startTime: timeStr,
        endTime: `${String(eventTime.getHours()).padStart(2, '0')}:${String(
          eventTime.getMinutes() + 1
        ).padStart(2, '0')}`,
        description: '1분 전 알림 테스트',
        location: '서울',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1, // 1분 전
      },
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // 알림이 표시될 때까지 대기 (최대 10초)
    // 고정된 시간이므로 알림이 즉시 표시되어야 함
    const notification = page.getByText(/1분 후.*1분 전 알림 일정.*일정이 시작됩니다/);
    await notification.waitFor({ state: 'visible', timeout: 10000 });
    await expect(notification).toBeVisible();
  });

  test('알림 10분 전: 알림이 정상적으로 표시된다', async ({ page, request }) => {
    // 고정된 시간(10:00)에서 10분 후(10:10)에 시작하는 일정 생성
    const fixedDate = new Date(FIXED_TIME);
    const eventTime = new Date(fixedDate.getTime() + 10 * 60 * 1000); // 10:10
    const dateStr = eventTime.toISOString().split('T')[0];
    const timeStr = `${String(eventTime.getHours()).padStart(2, '0')}:${String(
      eventTime.getMinutes()
    ).padStart(2, '0')}`;

    await request.post(`${apiBaseUrl}/api/events`, {
      data: {
        title: '10분 전 알림 일정',
        date: dateStr,
        startTime: timeStr,
        endTime: `${String(eventTime.getHours()).padStart(2, '0')}:${String(
          eventTime.getMinutes() + 1
        ).padStart(2, '0')}`,
        description: '10분 전 알림 테스트',
        location: '서울',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 10, // 10분 전
      },
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // 알림이 표시될 때까지 대기 (최대 10초)
    const notification = page.getByText(/10분 후.*10분 전 알림 일정.*일정이 시작됩니다/);
    await notification.waitFor({ state: 'visible', timeout: 10000 });
    await expect(notification).toBeVisible();
  });

  test('알림 1시간 전: 알림이 정상적으로 표시된다', async ({ page, request }) => {
    // 고정된 시간(10:00)에서 1시간 후(11:00)에 시작하는 일정 생성
    const fixedDate = new Date(FIXED_TIME);
    const eventTime = new Date(fixedDate.getTime() + 60 * 60 * 1000); // 11:00
    const dateStr = eventTime.toISOString().split('T')[0];
    const timeStr = `${String(eventTime.getHours()).padStart(2, '0')}:${String(
      eventTime.getMinutes()
    ).padStart(2, '0')}`;

    await request.post(`${apiBaseUrl}/api/events`, {
      data: {
        title: '1시간 전 알림 일정',
        date: dateStr,
        startTime: timeStr,
        endTime: `${String(eventTime.getHours()).padStart(2, '0')}:${String(
          eventTime.getMinutes() + 1
        ).padStart(2, '0')}`,
        description: '1시간 전 알림 테스트',
        location: '서울',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 60, // 1시간 전
      },
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // 알림이 표시될 때까지 대기 (최대 10초)
    const notification = page.getByText(/60분 후.*1시간 전 알림 일정.*일정이 시작됩니다/);
    await notification.waitFor({ state: 'visible', timeout: 10000 });
    await expect(notification).toBeVisible();
  });

  test('알림 2시간 전: 알림이 정상적으로 표시된다', async ({ page, request }) => {
    // 고정된 시간(10:00)에서 2시간 후(12:00)에 시작하는 일정 생성
    const fixedDate = new Date(FIXED_TIME);
    const eventTime = new Date(fixedDate.getTime() + 120 * 60 * 1000); // 12:00
    const dateStr = eventTime.toISOString().split('T')[0];
    const timeStr = `${String(eventTime.getHours()).padStart(2, '0')}:${String(
      eventTime.getMinutes()
    ).padStart(2, '0')}`;

    await request.post(`${apiBaseUrl}/api/events`, {
      data: {
        title: '2시간 전 알림 일정',
        date: dateStr,
        startTime: timeStr,
        endTime: `${String(eventTime.getHours()).padStart(2, '0')}:${String(
          eventTime.getMinutes() + 1
        ).padStart(2, '0')}`,
        description: '2시간 전 알림 테스트',
        location: '서울',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 120, // 2시간 전
      },
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // 알림이 표시될 때까지 대기 (최대 10초)
    const notification = page.getByText(/120분 후.*2시간 전 알림 일정.*일정이 시작됩니다/);
    await notification.waitFor({ state: 'visible', timeout: 10000 });
    await expect(notification).toBeVisible();
  });

  test('알림 1일 전: 알림이 정상적으로 표시된다', async ({ page, request }) => {
    // 고정된 시간(10:00)에서 1일 후(다음날 10:00)에 시작하는 일정 생성
    const fixedDate = new Date(FIXED_TIME);
    const eventTime = new Date(fixedDate.getTime() + 1440 * 60 * 1000); // 다음날 10:00
    const dateStr = eventTime.toISOString().split('T')[0];
    const timeStr = `${String(eventTime.getHours()).padStart(2, '0')}:${String(
      eventTime.getMinutes()
    ).padStart(2, '0')}`;

    await request.post(`${apiBaseUrl}/api/events`, {
      data: {
        title: '1일 전 알림 일정',
        date: dateStr,
        startTime: timeStr,
        endTime: `${String(eventTime.getHours()).padStart(2, '0')}:${String(
          eventTime.getMinutes() + 1
        ).padStart(2, '0')}`,
        description: '1일 전 알림 테스트',
        location: '서울',
        category: '업무',
        repeat: { type: 'none', interval: 0 },
        notificationTime: 1440, // 1일 전
      },
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // 알림이 표시될 때까지 대기 (최대 10초)
    const notification = page.getByText(/1440분 후.*1일 전 알림 일정.*일정이 시작됩니다/);
    await notification.waitFor({ state: 'visible', timeout: 10000 });
    await expect(notification).toBeVisible();
  });
});
