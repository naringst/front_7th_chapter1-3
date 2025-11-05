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

// 테스트 데이터 설정 헬퍼 함수들
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

// 겹치지 않는 일정 생성 (명시적으로 겹치지 않는 시간대)
async function createNonOverlappingEvent(request: APIRequestContext) {
  await createEvent(request, {
    title: '기존 일정 (겹치지 않음)',
    date: '2025-11-06',
    startTime: '02:00',
    endTime: '02:30',
    description: '겹치지 않는 기존 일정',
    location: '서울',
    category: '개인',
  });
}

test.describe('일반 이벤트 생성', () => {
  test.beforeEach(async ({ page, request }) => {
    // 각 테스트 전에 데이터 초기화
    await clearEvents(request);

    // 페이지를 초기 상태로 설정
    await page.goto(startUrl);
    // Playwright의 auto-waiting이 첫 번째 상호작용 전에 자동으로 대기함
  });

  test('일반 이벤트 생성: 겹치지 않는 일정은 정상적으로 생성된다', async ({ page, request }) => {
    // 기존에 겹치지 않는 일정이 있는 경우도 테스트
    await createNonOverlappingEvent(request);
    await page.reload();

    // 새 일정 생성
    await page.getByLabel('제목').fill('테스트 제목입니다');
    await page.getByLabel('날짜').fill('2025-11-06');
    await page.getByLabel('시작 시간').fill('01:30');
    await page.getByLabel('종료 시간').fill('01:40');
    await page.getByLabel('설명').fill('This is a test event.');
    await page.getByLabel('위치').fill('Seoul');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '개인' }).click();
    await page.getByLabel('알림 설정').click();
    await page.getByRole('option', { name: '1분 전' }).click();

    await page.getByRole('button', { name: '일정 추가' }).click();

    // 일정이 추가되었습니다
    const toast = page.getByRole('alert');
    await expect(toast).toHaveText('일정이 추가되었습니다');

    // 캘린더에 이벤트가 보인다.
    await expect(
      page
        .locator('div')
        .filter({ hasText: /^테스트 제목입니다$/ })
        .first()
    ).toBeVisible();

    // 이벤트 리스트에 생성되어 보이도록
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('테스트 제목입니다')).toBeVisible();
  });

  // 일정 겹침 경고 - E2E에서는 핵심 사용자 시나리오만 테스트
  // (세밀한 겹침 로직은 unit/easy.eventOverlap.spec.ts에서 이미 테스트됨)

  test('일정 겹침 시 경고 Dialog가 표시되고, "계속 진행"으로 저장할 수 있다', async ({
    page,
    request,
  }) => {
    // 명시적으로 겹치는 기존 일정 생성 (01:35-01:45)
    await createOverlappingEvent(request);
    await page.reload();

    // 겹치는 새 일정 생성 시도 (01:30-01:40)
    await page.getByLabel('제목').fill('새로운 겹치는 일정');
    await page.getByLabel('날짜').fill('2025-11-06');
    await page.getByLabel('시작 시간').fill('01:30');
    await page.getByLabel('종료 시간').fill('01:40');
    await page.getByLabel('설명').fill('겹치는 일정 테스트');
    await page.getByLabel('위치').fill('Seoul');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '개인' }).click();
    await page.getByLabel('알림 설정').click();
    await page.getByRole('option', { name: '1분 전' }).click();

    await page.getByRole('button', { name: '일정 추가' }).click();

    // 겹침 경고 Dialog 확인
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('일정 겹침 경고')).toBeVisible();
    await expect(dialog.getByText(/기존 일정/)).toBeVisible();

    // "계속 진행"으로 저장
    await dialog.getByRole('button', { name: '계속 진행' }).click();
    await expect(dialog).not.toBeVisible();

    // 저장 성공 확인
    const toast = page.getByRole('alert');
    await expect(toast).toHaveText('일정이 추가되었습니다');
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('새로운 겹치는 일정')).toBeVisible();
  });

  test('일정 겹침 시 경고 Dialog에서 "취소" 클릭 시 일정이 저장되지 않는다', async ({
    page,
    request,
  }) => {
    // 명시적으로 겹치는 기존 일정 생성 (01:35-01:45)
    await createOverlappingEvent(request);
    await page.reload();

    // 겹치는 새 일정 생성 시도 (01:30-01:40)
    await page.getByLabel('제목').fill('취소될 일정');
    await page.getByLabel('날짜').fill('2025-11-06');
    await page.getByLabel('시작 시간').fill('01:30');
    await page.getByLabel('종료 시간').fill('01:40');
    await page.getByLabel('설명').fill('취소 테스트');
    await page.getByLabel('위치').fill('Seoul');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '개인' }).click();
    await page.getByLabel('알림 설정').click();
    await page.getByRole('option', { name: '1분 전' }).click();

    await page.getByRole('button', { name: '일정 추가' }).click();

    // 겹침 경고 Dialog 확인
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('일정 겹침 경고')).toBeVisible();

    // "취소" 클릭
    await dialog.getByRole('button', { name: '취소' }).click();
    await expect(dialog).not.toBeVisible();

    // 일정이 저장되지 않았는지 확인 (성공 토스트가 없어야 함)
    // 토스트가 있더라도 '일정이 추가되었습니다'가 아니어야 함
    const toasts = page.getByRole('alert');
    const toastCount = await toasts.count();
    if (toastCount > 0) {
      await expect(toasts.first()).not.toHaveText('일정이 추가되었습니다');
    }

    // 이벤트 리스트에 추가되지 않았는지 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('취소될 일정')).not.toBeVisible();
  });
});
