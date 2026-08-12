import type { AdminInquiryListItem } from '@/entities/inquiry';

export const MOCK_ADMIN_INQUIRIES: AdminInquiryListItem[] = [
  {
    inquiryId: '1',
    inquiryTypeLabel: '서비스 이용',
    title: 'AI 추천 결과가 보이지 않습니다.',
    content:
      '프로필에 기술 스택을 등록했지만 맞춤 추천 공고가 표시되지 않습니다. 확인 부탁드립니다.',
    status: 'RECEIVED',
    author: {
      studentNumber: '1319',
      name: '김민재',
      cohort: 10,
      department: '스마트IoT과',
    },
    createdAt: '2026-08-01T10:24:00',
    answeredAt: null,
    answer: null,
  },
  {
    inquiryId: '2',
    inquiryTypeLabel: '지원 문의',
    title: '지원서를 수정할 수 있나요?',
    content: '제출한 지원서의 자기소개 내용을 수정하고 싶습니다. 수정 방법을 알려주세요.',
    status: 'IN_PROGRESS',
    author: {
      studentNumber: '1320',
      name: '박보검',
      cohort: 10,
      department: '소프트웨어개발과',
    },
    createdAt: '2026-08-01T10:24:00',
    answeredAt: null,
    answer: null,
  },
  {
    inquiryId: '3',
    inquiryTypeLabel: '계정, 프로필',
    title: '프로필 이미지가 등록되지 않습니다.',
    content: '프로필 이미지를 선택해도 저장되지 않습니다.',
    status: 'ANSWERED',
    author: {
      studentNumber: '1321',
      name: '차은우',
      cohort: 10,
      department: '스마트IoT과',
    },
    createdAt: '2026-08-01T10:24:00',
    answeredAt: '2026-08-01T10:24:00',
    answer: '이미지 형식을 확인한 뒤 다시 등록해 주세요.',
  },
  {
    inquiryId: '4',
    inquiryTypeLabel: '공고 문의',
    title: '공고 내용이 실제와 다릅니다.',
    content: 'GETI에 표시된 마감일과 기업 채용 페이지의 마감일이 다릅니다.',
    status: 'CLOSED',
    author: {
      studentNumber: '1322',
      name: '박서준',
      cohort: 10,
      department: '소프트웨어개발과',
    },
    createdAt: '2026-08-01T10:24:00',
    answeredAt: '2026-08-01T10:24:00',
    answer: '공고 정보를 수정했습니다. 제보해 주셔서 감사합니다.',
  },
];
