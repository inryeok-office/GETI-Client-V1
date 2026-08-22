import { describe, expect, it } from 'vitest';

import { mapInquiryDetail, mapInquiryListItem } from './mapInquiry';

describe('inquiry mapper', () => {
  it('목록 응답의 숫자 ID와 문의 유형을 카드 모델로 변환한다', () => {
    expect(
      mapInquiryListItem({
        inquiryId: 25,
        inquiryType: 'FEATURE_REQUEST',
        title: '기능 요청',
        status: 'RECEIVED',
        createdAt: '2026-08-22T10:00:00',
        answeredAt: null,
      }),
    ).toEqual({
      inquiryId: '25',
      inquiryType: 'FEATURE_REQUEST',
      title: '기능 요청',
      status: 'RECEIVED',
      createdAt: '2026-08-22T10:00:00',
    });
  });

  it('상세 응답의 답변 배열과 파일 ID를 화면 모델로 변환한다', () => {
    const detail = mapInquiryDetail({
      inquiryId: 7,
      inquiryType: 'ERROR',
      title: '오류 문의',
      content: '오류가 발생했습니다.',
      status: 'ANSWERED',
      author: {
        memberId: 1,
        name: '테스트 학생',
        profileImageUrl: null,
        cohort: 10,
        department: 'SOFTWARE',
        isPublic: true,
      },
      files: [
        {
          fileId: 3,
          originalName: 'error.png',
          contentType: 'image/png',
          size: 1024,
          downloadUrl: '/api/v1/files/3/download',
        },
      ],
      assignee: null,
      answers: [
        {
          answerId: 9,
          inquiryId: 7,
          authorMemberId: 5,
          content: '수정했습니다.',
          files: [],
          createdAt: '2026-08-22T11:00:00',
        },
      ],
      createdAt: '2026-08-22T10:00:00',
      updatedAt: '2026-08-22T11:00:00',
    });

    expect(detail.inquiryId).toBe('7');
    expect(detail.files[0]?.fileId).toBe('3');
    expect(detail.answers).toEqual([
      {
        answerId: '9',
        content: '수정했습니다.',
        createdAt: '2026-08-22T11:00:00',
        files: [],
      },
    ]);
  });
});
