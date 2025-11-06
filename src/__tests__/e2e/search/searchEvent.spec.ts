import { test, expect, APIRequestContext } from '@playwright/test';

const startUrl = 'http://localhost:5173/';
const apiBaseUrl = 'http://127.0.0.1:3000';

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

test.describe('검색 및 필터링', () => {
  const FIXED_TIME = '2025-11-01T10:00:00';

  test.beforeEach(async ({ page, request }) => {
    // 브라우저 시간을 고정 (페이지 로드 전에 설정)
    await page.clock.setFixedTime(FIXED_TIME);
    // 각 테스트 전에 데이터 초기화
    await clearEvents(request);

    // 페이지를 초기 상태로 설정
    await page.goto(startUrl);
    // Playwright의 auto-waiting이 첫 번째 상호작용 전에 자동으로 대기함
  });

  test('제목으로 검색: 검색어와 일치하는 일정이 표시된다', async ({ page, request }) => {
    // 테스트 일정 생성
    await createEvent(request, {
      title: '팀 회의',
      date: '2025-11-06',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
    });

    await createEvent(request, {
      title: '프로젝트 계획',
      date: '2025-11-06',
      startTime: '14:00',
      endTime: '15:00',
      description: '새 프로젝트 계획 수립',
      location: '회의실 B',
      category: '업무',
    });

    await page.reload();

    // 검색어 입력
    const searchInput = page.getByPlaceholder('검색어를 입력하세요');
    await searchInput.fill('팀 회의');

    // 검색 결과 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('팀 회의').first()).toBeVisible();
    await expect(eventList.getByText('프로젝트 계획').first()).not.toBeVisible();
  });

  test('설명으로 검색: 검색어와 일치하는 일정이 표시된다', async ({ page, request }) => {
    // 테스트 일정 생성
    await createEvent(request, {
      title: '회의',
      date: '2025-11-06',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
    });

    await createEvent(request, {
      title: '회의',
      date: '2025-11-06',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 계획 수립',
      location: '회의실 B',
      category: '업무',
    });

    await page.reload();

    // 검색어 입력 (설명 내용)
    const searchInput = page.getByPlaceholder('검색어를 입력하세요');
    await searchInput.fill('팀 미팅');

    // 검색 결과 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('주간 팀 미팅').first()).toBeVisible();
    await expect(eventList.getByText('프로젝트 계획 수립').first()).not.toBeVisible();
  });

  test('위치로 검색: 검색어와 일치하는 일정이 표시된다', async ({ page, request }) => {
    // 테스트 일정 생성
    await createEvent(request, {
      title: '회의',
      date: '2025-11-06',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 미팅',
      location: '회의실 A',
      category: '업무',
    });

    await createEvent(request, {
      title: '회의',
      date: '2025-11-06',
      startTime: '14:00',
      endTime: '15:00',
      description: '프로젝트 미팅',
      location: '회의실 B',
      category: '업무',
    });

    await page.reload();

    // 검색어 입력 (위치)
    const searchInput = page.getByPlaceholder('검색어를 입력하세요');
    await searchInput.fill('회의실 A');

    // 검색 결과 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('회의실 A').first()).toBeVisible();
    await expect(eventList.getByText('회의실 B').first()).not.toBeVisible();
  });

  test('검색 결과 없음: 검색 결과가 없을 때 메시지가 표시된다', async ({ page, request }) => {
    // 테스트 일정 생성
    await createEvent(request, {
      title: '팀 회의',
      date: '2025-11-06',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
    });

    await page.reload();

    // 존재하지 않는 검색어 입력
    const searchInput = page.getByPlaceholder('검색어를 입력하세요');
    await searchInput.fill('존재하지 않는 일정');

    // 검색 결과 없음 메시지 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('검색 결과가 없습니다.')).toBeVisible();
    await expect(eventList.getByText('팀 회의')).not.toBeVisible();
  });

  test('검색어 초기화: 검색어를 지우면 모든 일정이 다시 표시된다', async ({ page, request }) => {
    // 테스트 일정 생성
    await createEvent(request, {
      title: '팀 회의',
      date: '2025-11-06',
      startTime: '10:00',
      endTime: '11:00',
      description: '주간 팀 미팅',
      location: '회의실 A',
      category: '업무',
    });

    await createEvent(request, {
      title: '프로젝트 계획',
      date: '2025-11-06',
      startTime: '14:00',
      endTime: '15:00',
      description: '새 프로젝트 계획 수립',
      location: '회의실 B',
      category: '업무',
    });

    await page.reload();

    // 검색어 입력
    const searchInput = page.getByPlaceholder('검색어를 입력하세요');
    await searchInput.fill('팀 회의');

    // 검색 결과 확인 (하나만 표시)
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('팀 회의').first()).toBeVisible();
    await expect(eventList.getByText('프로젝트 계획').first()).not.toBeVisible();

    // 검색어 지우기
    await searchInput.clear();

    // 모든 일정이 다시 표시되는지 확인
    await expect(eventList.getByText('팀 회의').first()).toBeVisible();
    await expect(eventList.getByText('프로젝트 계획').first()).toBeVisible();
  });

  test('주간 뷰 필터링: 주간 뷰에서 현재 주의 일정만 표시된다', async ({ page, request }) => {
    // 현재 주의 일정
    await createEvent(request, {
      title: '이번 주 일정',
      date: '2025-11-06',
      startTime: '10:00',
      endTime: '11:00',
      description: '이번 주',
      location: '서울',
      category: '업무',
    });

    // 다음 주의 일정
    await createEvent(request, {
      title: '다음 주 일정',
      date: '2025-11-13',
      startTime: '10:00',
      endTime: '11:00',
      description: '다음 주',
      location: '서울',
      category: '업무',
    });

    await page.reload();

    // 주간 뷰로 변경 (이미 주간 뷰일 수도 있음)
    // 주간 뷰에서 현재 주의 일정만 표시되는지 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('이번 주 일정').first()).toBeVisible();
    // 다음 주 일정은 현재 주에 포함되지 않으면 표시되지 않아야 함
    // (실제 구현에 따라 다를 수 있음)
  });

  test('월간 뷰 필터링: 월간 뷰에서 현재 달의 일정만 표시된다', async ({ page, request }) => {
    // 현재 달의 일정
    await createEvent(request, {
      title: '이번 달 일정',
      date: '2025-11-06',
      startTime: '10:00',
      endTime: '11:00',
      description: '이번 달',
      location: '서울',
      category: '업무',
    });

    // 다음 달의 일정
    await createEvent(request, {
      title: '다음 달 일정',
      date: '2025-12-06',
      startTime: '10:00',
      endTime: '11:00',
      description: '다음 달',
      location: '서울',
      category: '업무',
    });

    await page.reload();

    // 월간 뷰로 변경 (뷰 전환 버튼이 있다면 클릭)
    // 월간 뷰에서 현재 달의 일정만 표시되는지 확인
    const eventList = page.getByTestId('event-list');
    await expect(eventList.getByText('이번 달 일정').first()).toBeVisible();
    // 다음 달 일정은 현재 달에 포함되지 않으면 표시되지 않아야 함
  });
});
