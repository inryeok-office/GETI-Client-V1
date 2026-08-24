import type { Notification } from './types';

export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    notificationId: 1,
    title: '지원서 수정 요청이 도착했습니다.',
    content: '제출한 지원서를 확인해 주세요.',
    relativeTime: '10분 전',
    isRead: false,
    targetStatus: 'AVAILABLE',
    targetType: 'JOB_APPLICATION',
    deepLink: '/applications/1',
  },
  {
    notificationId: 2,
    title: '북마크한 공고의 마감일이 다가옵니다.',
    content: '공고가 곧 마감됩니다.',
    relativeTime: '2시간 전',
    isRead: false,
    targetStatus: 'AVAILABLE',
    targetType: 'JOB',
    deepLink: '/jobs/school/2',
  },
  {
    notificationId: 3,
    title: '프로그램 신청이 완료되었습니다.',
    content: '신청 내용을 확인해 주세요.',
    relativeTime: '어제',
    isRead: true,
    targetStatus: 'AVAILABLE',
    targetType: 'PROGRAM',
    deepLink: '/programs/3',
  },
];

export const MOCK_NOTIFICATIONS_WITH_DELETED_TARGET: Notification[] = [
  MOCK_NOTIFICATIONS[0],
  {
    ...MOCK_NOTIFICATIONS[1],
    targetStatus: 'DELETED',
    deepLink: null,
  },
  MOCK_NOTIFICATIONS[2],
];
