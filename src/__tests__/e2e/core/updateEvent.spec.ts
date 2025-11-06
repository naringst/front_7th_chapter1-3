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

// 겹치는 일정 생성 (명시적으로 겹치는 시간대)
async function createOverlappingEvent(request: APIRequestContext) {
  await createEvent(request, {
    title: '기존 일정',
    date: '2025-11-06',
    startTime: '01:35',
    endTime: '01:45',
    description: '겹치는 기존 일정',
    location: '서울',
    category: '개인',
  });
}

test.describe('일반 일정 수정', () => {
  test.beforeEach(async ({ page, request }) => {
    // 각 테스트 전에 데이터 초기화
    await clearEvents(request);

    // 페이지를 초기 상태로 설정
    await page.goto(startUrl);
    // Playwright의 auto-waiting이 첫 번째 상호작용 전에 자동으로 대기함
  });

  test('일반 일정 수정: 겹치지 않는 일정은 정상적으로 수정된다', async ({ page, request }) => {
    // 수정할 일정 생성
    await createEvent(request, {
      title: '첫 번째 수정 일정',
      date: '2025-11-06',
      startTime: '10:00',
      endTime: '11:00',
      description: '수정 전 설명',
      location: '서울',
      category: '개인',
    });
    await page.reload();

    // 생성한 일정이 보이는지 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('첫 번째 수정 일정')).toBeVisible();

    // 수정 버튼 클릭
    // 제목을 포함하는 Box를 찾고, 그 안에서 Edit 버튼 찾기

    // 수정 버튼 클릭
    // 제목을 포함하는 Box를 찾고, 그 안에서 Edit 버튼 찾기
    const eventTitle = eventList.getByText('첫 번째 수정 일정');
    // 제목이 있는 Box를 찾기 위해 부모를 따라 올라감
    // Typography -> Stack(direction="row") -> Stack(왼쪽) -> Stack(justifyContent) -> Box
    const eventCard = eventTitle.locator('..').locator('..').locator('..').locator('..');
    await eventCard.getByRole('button', { name: 'Edit event' }).click();

    // 폼이 수정 모드로 변경되었는지 확인
    await expect(page.getByRole('heading', { name: '일정 수정' })).toBeVisible();

    // 일정 정보 수정
    await page.getByLabel('제목').fill('수정된 일정');
    await page.getByLabel('설명').fill('수정된 설명');
    await page.getByLabel('위치').fill('부산');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();

    // 일정 수정 버튼 클릭
    await page.getByRole('button', { name: '일정 수정' }).click();

    // 일정이 수정되었습니다 토스트 확인
    await expect(page.getByText('일정이 수정되었습니다')).toBeVisible();

    // 수정된 일정이 보이는지 확인
    await expect(eventList.getByText('수정된 일정')).toBeVisible();
    await expect(eventList.getByText('수정된 설명')).toBeVisible();

    // 이전 일정이 사라졌는지 확인
    await expect(eventList.getByText('첫 번째 수정 일정')).not.toBeVisible();
  });

  test('일정 수정 시 겹침 경고 Dialog가 표시되고, "계속 진행"으로 수정할 수 있다', async ({
    page,
    request,
  }) => {
    // 기존에 겹치는 일정 생성 (01:35-01:45)
    await createOverlappingEvent(request);

    // 수정할 일정 생성 (01:30-01:40)
    await createEvent(request, {
      title: '수정할 일정',
      date: '2025-11-06',
      startTime: '01:30',
      endTime: '01:40',
      description: '수정 전',
      location: '서울',
      category: '개인',
    });
    await page.reload();

    // 수정할 일정이 보이는지 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('수정할 일정')).toBeVisible();

    // 수정 버튼 클릭
    // 제목 텍스트를 찾고, 그 부모 Box를 찾아서 Edit 버튼 찾기
    const eventTitle = eventList.getByText('수정할 일정');
    // 제목이 있는 Box를 찾기 위해 부모를 따라 올라감
    // Typography -> Stack(direction="row") -> Stack(왼쪽) -> Stack(justifyContent) -> Box
    const eventCard = eventTitle.locator('..').locator('..').locator('..').locator('..');
    await eventCard.getByRole('button', { name: 'Edit event' }).click();

    // 겹치는 시간대로 수정 (01:35-01:45로 변경)
    await page.getByLabel('시작 시간').fill('01:35');
    await page.getByLabel('종료 시간').fill('01:45');

    // 일정 수정 버튼 클릭
    await page.getByRole('button', { name: '일정 수정' }).click();

    // 겹침 경고 Dialog 확인
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('일정 겹침 경고')).toBeVisible();
    await expect(dialog.getByText(/기존 일정/)).toBeVisible();

    // "계속 진행"으로 수정
    await dialog.getByRole('button', { name: '계속 진행' }).click();
    await expect(dialog).not.toBeVisible();

    // 수정 성공 확인
    await expect(page.getByText('일정이 수정되었습니다')).toBeVisible();
  });

  test('일정 수정 시 겹침 경고 Dialog에서 "취소" 클릭 시 일정이 수정되지 않는다', async ({
    page,
    request,
  }) => {
    // 기존에 겹치는 일정 생성 (01:35-01:45)
    await createOverlappingEvent(request);

    // 수정할 일정 생성 (01:30-01:40)
    await createEvent(request, {
      title: '수정할 일정',
      date: '2025-11-06',
      startTime: '01:30',
      endTime: '01:40',
      description: '수정 전',
      location: '서울',
      category: '개인',
    });
    await page.reload();

    // 수정할 일정이 보이는지 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('수정할 일정')).toBeVisible();

    // 수정 버튼 클릭
    // 제목을 포함하는 Box를 찾고, 그 안에서 Edit 버튼 찾기
    const eventTitle = eventList.getByText('수정할 일정');
    // 제목이 있는 Box를 찾기 위해 부모를 따라 올라감
    // Typography -> Stack(direction="row") -> Stack(왼쪽) -> Stack(justifyContent) -> Box
    const eventCard = eventTitle.locator('..').locator('..').locator('..').locator('..');
    await eventCard.getByRole('button', { name: 'Edit event' }).click();

    // 겹치는 시간대로 수정 (01:35-01:45로 변경)
    await page.getByLabel('시작 시간').fill('01:35');
    await page.getByLabel('종료 시간').fill('01:45');

    // 일정 수정 버튼 클릭
    await page.getByRole('button', { name: '일정 수정' }).click();

    // 겹침 경고 Dialog 확인
    const dialog = page.getByRole('dialog').filter({ hasText: '일정 겹침 경고' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('일정 겹침 경고')).toBeVisible();

    // "취소" 클릭
    await dialog.getByRole('button', { name: '취소' }).click();
    await expect(dialog).not.toBeVisible();

    // 원래 일정이 여전히 보이는지 확인
    await expect(eventList.getByText('수정할 일정')).toBeVisible();
  });
});
