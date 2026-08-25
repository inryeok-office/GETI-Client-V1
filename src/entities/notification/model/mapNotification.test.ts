import { describe, expect, it } from 'vitest';

import type { NotificationApiItem } from './types';
import { mapNotification } from './mapNotification';

const BASE_NOTIFICATION: NotificationApiItem = {
  notificationId: 1,
  notificationType: 'INQUIRY_ANSWERED',
  title: '문의 답변이 등록되었습니다',
  content: '등록한 문의의 답변을 확인해주세요.',
  targetType: 'INQUIRY',
  targetId: 3,
  targetAvailable: true,
  targetUnavailableReason: null,
  deepLink: '/inquiries/3',
  read: false,
  readAt: null,
  createdAt: '2026-08-24T11:50:00',
};

describe('mapNotification', () => {
  it('서버의 이동 가능 여부와 읽음 값을 UI 모델로 변환한다', () => {
    const result = mapNotification(BASE_NOTIFICATION);

    expect(result).toMatchObject({
      notificationId: 1,
      isRead: false,
      targetStatus: 'AVAILABLE',
      targetType: 'INQUIRY',
      deepLink: '/inquiries/3',
    });
  });

  it('서버가 이동 불가 사유를 주지 않은 대상은 지원하지 않는 대상으로 변환한다', () => {
    const result = mapNotification({
      ...BASE_NOTIFICATION,
      targetType: 'PORTFOLIO_REQUEST',
      targetAvailable: false,
      targetUnavailableReason: null,
      deepLink: null,
    });

    expect(result.targetStatus).toBe('UNSUPPORTED');
  });

  it('서버 계약과 다른 외부 URL은 이동 경로로 사용하지 않는다', () => {
    const result = mapNotification({
      ...BASE_NOTIFICATION,
      deepLink: 'https://malicious.example.com',
    });

    expect(result).toMatchObject({ targetStatus: 'UNSUPPORTED', deepLink: null });
  });

  it.each(['/\\evil.example.com', '/inquiries/999', '/programs/3'])(
    '대상 유형과 ID에 맞지 않는 경로 %s는 이동 경로로 사용하지 않는다',
    (deepLink) => {
      const result = mapNotification({
        ...BASE_NOTIFICATION,
        deepLink,
      });

      expect(result).toMatchObject({ targetStatus: 'UNSUPPORTED', deepLink: null });
    },
  );

  it.each([
    ['JOB', 7, '/jobs/7', '/jobs/7'],
    ['JOB_APPLICATION', 8, '/job-applications/8', '/applications/8'],
    ['PROGRAM', 9, '/programs/9', '/programs/9'],
    ['PORTFOLIO_REQUEST', 10, '/portfolios/10', '/portfolios/10'],
    ['INQUIRY', 11, '/inquiries/11', '/inquiries/11'],
  ] as const)(
    '%s 서버 경로를 Web에서 처리할 수 있는 경로로 변환한다',
    (targetType, targetId, deepLink, expected) => {
      const result = mapNotification({
        ...BASE_NOTIFICATION,
        targetType,
        targetId,
        deepLink,
      });

      expect(result.deepLink).toBe(expected);
    },
  );
});
