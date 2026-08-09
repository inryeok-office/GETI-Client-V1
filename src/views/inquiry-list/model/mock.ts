import type { InquiryListItem } from '@/entities/inquiry';

export const MOCK_INQUIRIES: InquiryListItem[] = [
  {
    inquiryId: '1',
    title: '프로필 정보 관련 문의',
    status: 'ANSWERED',
    createdAt: '2026-07-30T09:00:00',
  },
  {
    inquiryId: '2',
    title: '지원서 수정 요청은 어디서 확인하나요?',
    status: 'IN_PROGRESS',
    createdAt: '2026-07-30T10:30:00',
  },
  {
    inquiryId: '3',
    title: '프로그램 신청 취소 관련 문의',
    status: 'CLOSED',
    createdAt: '2026-07-30T14:00:00',
  },
];
