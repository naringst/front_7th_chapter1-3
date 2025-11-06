import { test, expect, APIRequestContext } from '@playwright/test';

import { Event } from '../../../types';

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

test.describe('반복 일정 생성', () => {
  test.beforeEach(async ({ page, request }) => {
    // 각 테스트 전에 데이터 초기화
    await clearEvents(request);

    // 페이지를 초기 상태로 설정
    await page.goto(startUrl);
    // Playwright의 auto-waiting이 첫 번째 상호작용 전에 자동으로 대기함
  });

  test('매일 반복 일정 생성: 정상적으로 생성된다', async ({ page, request }) => {
    // 반복 일정 생성 폼 입력
    await page.getByLabel('제목').fill('매일 반복 일정');
    await page.getByLabel('날짜').fill('2025-11-06');
    await page.getByLabel('시작 시간').fill('10:00');
    await page.getByLabel('종료 시간').fill('11:00');
    await page.getByLabel('설명').fill('매일 반복되는 일정입니다.');
    await page.getByLabel('위치').fill('온라인');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();

    // 반복 일정 체크박스 선택
    await page.getByLabel('반복 일정').check();

    // 반복 유형 선택
    await page.getByLabel('반복 유형').click();
    await page.getByRole('option', { name: '매일' }).click();

    // 반복 간격 입력
    await page.getByLabel('반복 간격').fill('1');

    // 반복 종료일 입력
    await page.getByLabel('반복 종료일').fill('2025-12-31');

    // 알림 설정
    await page.getByLabel('알림 설정').click();
    await page.getByRole('option', { name: '1분 전' }).click();

    // 일정 추가 버튼 클릭
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 일정이 추가되었습니다 토스트 확인
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // API를 통해 생성된 일정 확인
    const response = await request.get(`${apiBaseUrl}/api/events`);
    const { events } = await response.json();

    // 매일 반복 일정이 생성되었는지 확인
    const createdEvent = events.find((event: Event) => event.title === '매일 반복 일정');
    expect(createdEvent).toBeDefined();
    expect(createdEvent.repeat.type).toBe('daily');
    expect(createdEvent.repeat.interval).toBe(1);

    // 페이지를 새로고침하여 최신 데이터 반영
    await page.reload();

    // 이벤트 리스트에 생성되어 보이는지 확인 (하나라도 있으면 됨)
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('매일 반복 일정').first()).toBeVisible();
  });

  test('매주 반복 일정 생성: 정상적으로 생성된다', async ({ page, request }) => {
    // 반복 일정 생성 폼 입력
    await page.getByLabel('제목').fill('매주 반복 일정');
    await page.getByLabel('날짜').fill('2025-11-06');
    await page.getByLabel('시작 시간').fill('14:00');
    await page.getByLabel('종료 시간').fill('15:00');
    await page.getByLabel('설명').fill('매주 반복되는 일정입니다.');
    await page.getByLabel('위치').fill('회의실 A');
    await page.getByLabel('카테고리').click();
    await page.getByRole('option', { name: '업무' }).click();

    // 반복 일정 체크박스 선택
    await page.getByLabel('반복 일정').check();

    // 반복 유형 선택
    await page.getByLabel('반복 유형').click();
    await page.getByRole('option', { name: '매주' }).click();

    // 반복 간격 입력
    await page.getByLabel('반복 간격').fill('1');

    // 반복 종료일 입력
    await page.getByLabel('반복 종료일').fill('2025-12-31');

    // 알림 설정
    await page.getByLabel('알림 설정').click();
    await page.getByRole('option', { name: '1시간 전' }).click();

    // 일정 추가 버튼 클릭
    await page.getByRole('button', { name: '일정 추가' }).click();

    // 일정이 추가되었습니다 토스트 확인
    await expect(page.getByText('일정이 추가되었습니다')).toBeVisible();

    // API를 통해 생성된 일정 확인
    const response = await request.get(`${apiBaseUrl}/api/events`);
    const { events } = await response.json();

    // 매주 반복 일정이 생성되었는지 확인
    const createdEvent = events.find((event: Event) => event.title === '매주 반복 일정');
    expect(createdEvent).toBeDefined();
    expect(createdEvent.repeat.type).toBe('weekly');
    expect(createdEvent.repeat.interval).toBe(1);

    // 페이지를 새로고침하여 최신 데이터 반영
    await page.reload();

    // 이벤트 리스트에 생성되어 보이는지 확인 (하나라도 있으면 됨)
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('매주 반복 일정').first()).toBeVisible();
  });
});
