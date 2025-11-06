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

// 테스트 데이터 설정 헬퍼 함수
async function createEvent(
  request: APIRequestContext,
  eventData: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description?: string;
    location?: string;
    category?: string;
    notificationTime?: number;
  }
) {
  await request.post(`${apiBaseUrl}/api/events`, {
    data: {
      title: eventData.title,
      date: eventData.date,
      startTime: eventData.startTime,
      endTime: eventData.endTime,
      description: eventData.description || '',
      location: eventData.location || '',
      category: eventData.category || '개인',
      repeat: { type: 'none', interval: 0 },
      notificationTime: eventData.notificationTime || 1,
    },
  });
}

test.describe('일반 일정 삭제', () => {
  test.beforeEach(async ({ page, request }) => {
    // 각 테스트 전에 데이터 초기화
    await clearEvents(request);

    // 페이지를 초기 상태로 설정
    await page.goto(startUrl);
    // Playwright의 auto-waiting이 첫 번째 상호작용 전에 자동으로 대기함
  });

  test('일반 일정 삭제: 삭제 버튼 클릭 시 일정이 삭제되고 토스트가 표시된다', async ({
    page,
    request,
  }) => {
    // 삭제할 일정 생성
    await createEvent(request, {
      title: '삭제할 일정',
      date: '2025-11-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '삭제될 일정 설명',
      location: '서울',
      category: '개인',
    });
    await page.reload();

    // 생성된 일정이 보이는지 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('삭제할 일정')).toBeVisible();

    // 캘린더에도 일정이 보이는지 확인
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^삭제할 일정$/ })
        .first()
    ).toBeVisible();

    // 삭제 버튼 클릭 (이벤트 카드에서)

    await page.getByRole('button', { name: 'Delete event' }).click();

    // 삭제 성공 토스트 확인
    await expect(page.getByText('일정이 삭제되었습니다')).toBeVisible();

    // 이벤트 리스트에서 사라졌는지 확인
    await expect(eventList.getByText('삭제할 일정')).not.toBeVisible();

    // 캘린더에서도 사라졌는지 확인
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^삭제할 일정$/ })
        .first()
    ).not.toBeVisible();
  });
});
