// drag and drop e2e tests
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

test.describe('드래그 앤 드롭으로 일정 이동', () => {
  test.beforeEach(async ({ page, request }) => {
    // 각 테스트 전에 데이터 초기화
    await clearEvents(request);

    // 페이지를 초기 상태로 설정
    await page.goto(startUrl);
  });

  test('이벤트를 다른 유효한 날짜로 드래그하면 날짜가 변경된다', async ({ page, request }) => {
    // 테스트 이벤트 생성 (2025-11-06)
    await createEvent(request, {
      title: '월간 뷰 이동 테스트',
      date: '2025-11-06',
      startTime: '10:00',
      endTime: '11:00',
      description: '드래그 테스트',
      location: '서울',
      category: '개인',
    });
    await page.reload();

    // 이벤트가 원래 날짜에 있는지 확인
    const originalDateCell = page
      .locator('table')
      .filter({ hasText: '6' })
      .locator('td')
      .filter({ hasText: '월간 뷰 이동 테스트' })
      .first();
    await expect(originalDateCell).toBeVisible();

    // 이벤트를 찾아서 드래그 (2025-11-06에서 2025-11-10으로)
    const eventItem = page
      .locator('div')
      .filter({ hasText: /^월간 뷰 이동 테스트$/ })
      .first();
    const targetCell = page
      .locator('table')
      .filter({ hasText: '10' })
      .locator('td')
      .filter({ hasText: '10' })
      .first();

    // 드래그 앤 드롭 실행
    await eventItem.dragTo(targetCell);

    // 잠시 대기 (낙관적 업데이트 및 서버 요청 완료 대기)
    await page.waitForTimeout(1000);

    // 이벤트가 새 날짜(10일)에 있는지 확인
    const newDateCell = page
      .locator('table')
      .filter({ hasText: '10' })
      .locator('td')
      .filter({ hasText: '월간 뷰 이동 테스트' })
      .first();
    await expect(newDateCell).toBeVisible();

    // 원래 날짜(6일) 셀을 찾고, 그 셀 내에서 이벤트가 사라졌는지 확인
    const originalCell = page
      .locator('table')
      .filter({ hasText: '6' })
      .locator('td')
      .filter({ hasText: '6' })
      .first();

    // 원래 셀 내에서 이벤트 텍스트를 찾는 locator
    const eventInOriginalCell = originalCell.getByText('월간 뷰 이동 테스트');
    await expect(eventInOriginalCell).toHaveCount(0);

    // API를 통해 날짜가 실제로 변경되었는지 확인
    const response = await request.get(`${apiBaseUrl}/api/events`);
    const { events } = await response.json();
    const movedEvent = events.find((e: { title: string }) => e.title === '월간 뷰 이동 테스트');
    expect(movedEvent?.date).toBe('2025-11-10');
  });

  /**
   * NOTE: 페어 프로그래밍
   *
   * 드라이버: 고다솜, 양진성
   * 네비게이터: 정나리, 이정민
   */

  test('캘린더 내 유효하지 않은 날짜로 드롭하면 이벤트가 변경되지 않는다', async ({
    page,
    request,
  }) => {
    // 테스트 이벤트 생성
    await createEvent(request, {
      title: '같은 날짜 테스트',
      date: '2025-11-06',
      startTime: '10:00',
      endTime: '11:00',
      description: '같은 날짜 드롭 테스트',
      location: '서울',
      category: '개인',
    });
    await page.reload();

    // API를 통해 원래 이벤트 정보 저장
    const responseBefore = await request.get(`${apiBaseUrl}/api/events`);
    const { events: eventsBefore } = await responseBefore.json();
    const originalEvent = eventsBefore.find(
      (e: { title: string }) => e.title === '같은 날짜 테스트'
    );
    const originalDate = originalEvent?.date;

    // 이벤트를 같은 날짜 셀로 드래그
    const eventItem = page
      .locator('div')
      .filter({ hasText: /^같은 날짜 테스트$/ })
      .first();
    const sameDateCell = page
      .locator('table')
      .filter({ hasText: '6' })
      .locator('td')
      .filter({ hasText: '6' })
      .first();

    await eventItem.dragTo(sameDateCell);

    // 잠시 대기
    await page.waitForTimeout(1000);

    // API를 통해 날짜가 변경되지 않았는지 확인
    const responseAfter = await request.get(`${apiBaseUrl}/api/events`);
    const { events: eventsAfter } = await responseAfter.json();
    const unchangedEvent = eventsAfter.find(
      (e: { title: string }) => e.title === '같은 날짜 테스트'
    );
    expect(unchangedEvent?.date).toBe(originalDate);
  });

  test('반복 이벤트를 다른 날짜로 드래그하면 반복 아이콘이 사라지고 단일 이벤트로 변경된다', async ({
    page,
    request,
  }) => {
    // 반복 일정 생성 (2025-11-06부터 매주 반복)
    await request.post(`${apiBaseUrl}/api/events`, {
      data: {
        title: '반복 드래그 테스트',
        date: '2025-11-06',
        startTime: '10:00',
        endTime: '11:00',
        description: '반복 일정',
        location: '서울',
        category: '개인',
        repeat: { type: 'weekly', interval: 1, endDate: '2025-12-31' },
        notificationTime: 1,
      },
    });
    await page.reload();
    await page.waitForLoadState('networkidle');

    // 이벤트 리스트에서 반복 일정 확인 및 반복 아이콘 확인
    const eventList = page.getByTestId('event-list');
    const eventBox = eventList.getByText('반복 드래그 테스트').first().locator('..').locator('..');

    // 반복 아이콘이 있는지 확인 (Repeat 아이콘 - MUI 아이콘)
    // 이벤트 박스 내에서 SVG 아이콘을 찾음
    const repeatIcon = eventBox.locator('svg').first();
    await expect(repeatIcon).toBeVisible();

    // 이벤트를 다른 날짜로 드래그 (2025-11-06에서 2025-11-10으로)
    const eventItem = page
      .locator('div')
      .filter({ hasText: /^반복 드래그 테스트$/ })
      .first();
    const targetCell = page
      .locator('table')
      .filter({ hasText: '10' })
      .locator('td')
      .filter({ hasText: '10' })
      .first();

    // 드래그 앤 드롭 실행
    await eventItem.dragTo(targetCell);

    // 잠시 대기 (낙관적 업데이트 및 서버 요청 완료 대기)
    await page.waitForTimeout(1000);
    await page.reload();
    await page.waitForLoadState('networkidle');

    // API를 통해 반복 속성이 제거되었는지 확인
    const response = await request.get(`${apiBaseUrl}/api/events`);
    const { events } = await response.json();
    const movedEvent = events.find((e: { title: string }) => e.title === '반복 드래그 테스트');
    expect(movedEvent).toBeDefined();
    expect(movedEvent?.date).toBe('2025-11-10');
    expect(movedEvent?.repeat.type).toBe('none');
    expect(movedEvent?.repeat.interval).toBe(0);

    // 이벤트 리스트에서 반복 아이콘이 사라졌는지 확인
    const updatedEventBox = eventList
      .getByText('반복 드래그 테스트')
      .first()
      .locator('..')
      .locator('..');
    // 반복 아이콘이 없어야 함 (SVG 아이콘이 없거나, Repeat 아이콘이 없어야 함)
    const updatedRepeatIcon = updatedEventBox.locator('svg').first();
    await expect(updatedRepeatIcon).toHaveCount(0);
  });
});
