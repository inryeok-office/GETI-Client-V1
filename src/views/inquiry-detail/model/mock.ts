import type { InquiryDetail } from '@/entities/inquiry';

export const MOCK_INQUIRY_DETAILS: InquiryDetail[] = [
  {
    inquiryId: '1',
    title: '프로필 정보 관련 문의',
    status: 'ANSWERED',
    createdAt: '2026-07-30T09:00:00',
    content: '프로필에 입력한 정보가 서비스에서 어떻게 표시되는지 궁금합니다.',
    answer: {
      content:
        '안녕하세요. 문의해 주셔서 감사합니다.\n프로필에 입력한 정보는 공개 범위 설정에 따라 다른 사용자에게 표시됩니다. 비공개로 설정한 정보는 본인만 확인할 수 있으며, 공개 설정은 언제든지 내 프로필에서 변경할 수 있습니다.',
      createdAt: '2026-07-31T11:00:00',
    },
  },
  {
    inquiryId: '2',
    title: '지원서 수정 요청은 어디서 확인하나요?',
    status: 'IN_PROGRESS',
    createdAt: '2026-07-30T10:30:00',
    content: '제출한 지원서의 수정 요청을 어디에서 확인할 수 있는지 궁금합니다.',
    answer: null,
  },
  {
    inquiryId: '3',
    title: '프로그램 신청 취소 관련 문의',
    status: 'CLOSED',
    createdAt: '2026-07-30T14:00:00',
    content: '신청한 프로그램을 취소하려면 어떻게 해야 하나요?',
    answer: {
      content: '프로그램 상세 화면에서 신청 취소 버튼을 눌러 취소할 수 있습니다.',
      createdAt: '2026-07-31T15:00:00',
    },
  },
];
