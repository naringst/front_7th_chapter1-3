import { test, expect, APIRequestContext } from '@playwright/test';

import { EventForm } from '../../../types';
import { generateRepeatEvents } from '../../../utils/generateRepeatEvents';

const startUrl = 'http://localhost:5173/';
const apiBaseUrl = 'http://localhost:3000';

// 테스트 데이터 초기화 헬퍼 함수
async function clearEvents(request: APIRequestContext) {
  try {
    const response = await request.get(`${apiBaseUrl}/api/events`);
    if (!response.ok()) {
      return; // 에러가 발생하면 무시하고 계속 진행
    }
    const data = await response.json();
    const events = data?.events || [];
    for (const event of events) {
      try {
        await request.delete(`${apiBaseUrl}/api/events/${event.id}`);
      } catch {
        // 개별 삭제 실패는 무시
      }
    }
  } catch {
    // 초기화 실패는 무시하고 계속 진행
  }
}

// 반복 일정 생성 헬퍼 함수
async function createRepeatEvent(
  request: APIRequestContext,
  eventData: {
    title: string;
    date: string;
    startTime: string;
    endTime: string;
    description?: string;
    location?: string;
    category?: string;
    repeat: { type: 'daily' | 'weekly' | 'monthly' | 'yearly'; interval: number; endDate: string };
    notificationTime?: number;
  }
) {
  // generateRepeatEvents를 사용하여 반복 일정 생성
  const eventForm: EventForm = {
    title: eventData.title,
    date: eventData.date,
    startTime: eventData.startTime,
    endTime: eventData.endTime,
    description: eventData.description || '',
    location: eventData.location || '',
    category: eventData.category || '개인',
    repeat: {
      type: eventData.repeat.type,
      interval: eventData.repeat.interval,
      endDate: eventData.repeat.endDate,
    },
    notificationTime: eventData.notificationTime || 1,
  };

  const repeatEvents = generateRepeatEvents(eventForm);

  // /api/events-list를 사용하여 여러 이벤트를 한 번에 생성
  await request.post(`${apiBaseUrl}/api/events-list`, {
    data: { events: repeatEvents },
  });
}

test.describe('반복 일정 수정', () => {
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

  test('반복 일정 수정: "예" 클릭 시 해당 일정만 수정된다', async ({ page, request }) => {
    // 반복 일정 생성 (고유한 날짜 사용: 2025-11-01)
    await createRepeatEvent(request, {
      title: '반복 일정 수정 테스트',
      date: '2025-11-01',
      startTime: '10:00',
      endTime: '11:00',
      description: '반복되는 일정',
      location: '서울',
      category: '개인',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
      notificationTime: 1,
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // 이벤트 리스트에서 반복 일정 확인
    const eventList = page.getByTestId('event-list');
    await eventList.waitFor({ state: 'visible', timeout: 10000 });
    await expect(eventList.getByText('반복 일정 수정 테스트').first()).toBeVisible({
      timeout: 10000,
    });

    // 수정 버튼 클릭 (이벤트 카드에서)
    // 이벤트 리스트에서 특정 제목을 가진 이벤트 카드를 찾고, 그 안의 수정 버튼을 클릭
    const eventCard = eventList
      .getByText('반복 일정 수정 테스트')
      .first()
      .locator('..')
      .locator('..')
      .locator('..')
      .locator('..');
    await eventCard.getByRole('button', { name: 'Edit event' }).click();

    // 반복 일정 수정 다이얼로그 확인
    const dialog = page.getByRole('dialog').filter({ hasText: '반복 일정 수정' });
    await dialog.waitFor({ state: 'visible', timeout: 10000 });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('반복 일정 수정')).toBeVisible();
    await expect(dialog.getByText('해당 일정만 수정하시겠어요?')).toBeVisible();

    // "예" 버튼 클릭 (해당 일정만 수정)
    await dialog.getByRole('button', { name: '예' }).click();

    // 폼이 수정 모드로 변경되었는지 확인
    await expect(page.getByRole('heading', { name: '일정 수정' })).toBeVisible();

    // 일정 정보 수정
    await page.getByLabel('제목').fill('수정된 반복 일정');
    await page.getByLabel('설명').fill('수정된 설명');
    await page.getByLabel('위치').fill('부산');

    // 일정 수정 버튼 클릭 (폼의 제출 버튼만 선택 - testid 사용)
    await page.getByTestId('event-submit-button').click();

    // API를 통해 해당 일정만 수정되었는지 확인
    const response = await request.get(`${apiBaseUrl}/api/events`);
    const { events } = await response.json();

    // 해당 날짜(2025-11-01)의 일정은 수정되었지만, 다른 날짜의 반복 일정은 원래대로 남아있어야 함
    const modifiedEvent = events.find(
      (e: { title: string; date: string }) =>
        e.title === '수정된 반복 일정' && e.date === '2025-11-01'
    );
    expect(modifiedEvent).toBeDefined(); // 해당 일정은 수정되어야 함

    // 다른 날짜의 반복 일정은 원래 제목으로 남아있어야 함
    const otherEvent = events.find(
      (e: { title: string; date: string }) =>
        e.title === '반복 일정 수정 테스트' && e.date === '2025-11-08'
    );
    expect(otherEvent).toBeDefined(); // 다른 날짜의 일정은 원래대로 남아있어야 함
  });

  test('반복 일정 수정: "아니오" 클릭 시 반복 일정 전체가 수정된다', async ({ page, request }) => {
    // 반복 일정 생성 (고유한 날짜 사용: 2025-11-02)
    await createRepeatEvent(request, {
      title: '반복 일정 전체 수정',
      date: '2025-11-02',
      startTime: '10:00',
      endTime: '11:00',
      description: '반복되는 일정',
      location: '서울',
      category: '개인',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
      notificationTime: 1,
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // 이벤트 리스트에서 반복 일정 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('반복 일정 전체 수정').first()).toBeVisible();

    // 수정 버튼 클릭 (이벤트 카드에서)
    // 이벤트 리스트에서 특정 제목을 가진 이벤트 카드를 찾고, 그 안의 수정 버튼을 클릭
    const eventCard = eventList
      .getByText('반복 일정 전체 수정')
      .first()
      .locator('..')
      .locator('..')
      .locator('..')
      .locator('..');
    await eventCard.getByRole('button', { name: 'Edit event' }).click();

    // 반복 일정 수정 다이얼로그 확인
    const dialog = page.getByRole('dialog').filter({ hasText: '반복 일정 수정' });
    await dialog.waitFor({ state: 'visible', timeout: 10000 });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('반복 일정 수정')).toBeVisible();
    await expect(dialog.getByText('해당 일정만 수정하시겠어요?')).toBeVisible();

    // "아니오" 버튼 클릭 (전체 시리즈 수정)
    await dialog.getByRole('button', { name: '아니오' }).click();

    // 폼이 수정 모드로 변경되었는지 확인
    await expect(page.getByRole('heading', { name: '일정 수정' })).toBeVisible();

    // 일정 정보 수정
    await page.getByLabel('제목').fill('전체 수정된 반복 일정');
    await page.getByLabel('설명').fill('전체 수정된 설명');
    await page.getByLabel('위치').fill('부산');

    // 일정 수정 버튼 클릭 (폼의 제출 버튼만 선택 - testid 사용)
    await page.getByTestId('event-submit-button').click();

    // API를 통해 반복 일정 전체가 수정되었는지 확인
    const response = await request.get(`${apiBaseUrl}/api/events`);
    const { events } = await response.json();

    // 모든 반복 일정이 수정되었는지 확인
    const allModifiedEvents = events.filter(
      (e: { title: string }) => e.title === '전체 수정된 반복 일정'
    );
    expect(allModifiedEvents.length).toBeGreaterThan(0); // 여러 개의 반복 일정이 수정되어야 함

    // 원래 제목의 일정이 남아있지 않아야 함
    const originalEvents = events.filter(
      (e: { title: string }) => e.title === '반복 일정 전체 수정'
    );
    expect(originalEvents).toHaveLength(0); // 원래 제목의 일정은 모두 수정되어야 함
  });

  test('반복 일정 수정: "취소" 클릭 시 아무 일도 일어나지 않는다', async ({ page, request }) => {
    // 반복 일정 생성 (고유한 날짜 사용: 2025-11-03)
    await createRepeatEvent(request, {
      title: '반복 일정 취소 테스트',
      date: '2025-11-03',
      startTime: '10:00',
      endTime: '11:00',
      description: '반복되는 일정',
      location: '서울',
      category: '개인',
      repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
      notificationTime: 1,
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    // 이벤트 리스트에서 반복 일정 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('반복 일정 취소 테스트').first()).toBeVisible();

    // 수정 버튼 클릭 (이벤트 카드에서)
    // 이벤트 리스트에서 특정 제목을 가진 이벤트 카드를 찾고, 그 안의 수정 버튼을 클릭
    const eventCard = eventList
      .getByText('반복 일정 취소 테스트')
      .first()
      .locator('..')
      .locator('..')
      .locator('..')
      .locator('..');
    await eventCard.getByRole('button', { name: 'Edit event' }).click();

    // 반복 일정 수정 다이얼로그 확인
    const dialog = page.getByRole('dialog').filter({ hasText: '반복 일정 수정' });
    await dialog.waitFor({ state: 'visible', timeout: 10000 });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('반복 일정 수정')).toBeVisible();
    await expect(dialog.getByText('해당 일정만 수정하시겠어요?')).toBeVisible();

    // "취소" 버튼 클릭
    await dialog.getByRole('button', { name: '취소' }).click();

    // 다이얼로그가 닫혔는지 확인
    await expect(dialog).not.toBeVisible();

    // 폼이 열리지 않았는지 확인
    await expect(page.getByRole('heading', { name: '일정 수정' })).not.toBeVisible();

    // API를 통해 일정이 수정되지 않았는지 확인
    const response = await request.get(`${apiBaseUrl}/api/events`);
    const { events } = await response.json();
    const remainingEvents = events.filter(
      (e: { title: string }) => e.title === '반복 일정 취소 테스트'
    );

    // 일정이 그대로 남아있어야 함
    expect(remainingEvents.length).toBeGreaterThan(0);

    // 이벤트 리스트에서도 여전히 보여야 함
    await expect(eventList.getByText('반복 일정 취소 테스트').first()).toBeVisible();
  });
});
