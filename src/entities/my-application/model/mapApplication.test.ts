import { describe, expect, it } from 'vitest';

import {
  mapMyApplicationDetail,
  mapMyApplicationHistory,
  mapMyApplicationListItem,
  mapMyApplicationListItems,
  mapMyApplicationStatus,
} from './mapApplication';
import type {
  MyApplicationDetailApiResponse,
  MyApplicationHistoryEntry,
  MyApplicationListApiItem,
} from './types';

const LIST_ITEM: MyApplicationListApiItem = {
  applicationId: 1,
  job: {
    jobId: 10,
    title: '프론트엔드 개발자',
    company: { companyId: 1, name: '토스페이먼츠', logoUrl: null },
  },
  status: 'SUBMITTED',
  submittedAt: '2026-07-28T14:32:00',
  updatedAt: '2026-07-28T14:32:00',
};

describe('mapMyApplicationStatus', () => {
  it('9종 API 상태를 화면 배지 4종으로 단순화한다', () => {
    expect(mapMyApplicationStatus('SUBMITTED')).toBe('received');
    expect(mapMyApplicationStatus('REVISION_REQUESTED')).toBe('reviewing');
    expect(mapMyApplicationStatus('APPROVED')).toBe('resultAnnounced');
    expect(mapMyApplicationStatus('WITHDRAWN')).toBe('cancelled');
  });

  it('DRAFT(임시저장)는 null을 돌려준다', () => {
    expect(mapMyApplicationStatus('DRAFT')).toBeNull();
  });
});

describe('mapMyApplicationListItem', () => {
  it('목록 항목을 카드 뷰 모델로 변환한다', () => {
    expect(mapMyApplicationListItem(LIST_ITEM)).toEqual({
      id: '1',
      companyName: '토스페이먼츠',
      jobTitle: '프론트엔드 개발자',
      jobMeta: '지원일 2026.07.28 14:32',
      status: 'received',
    });
  });

  it('DRAFT 항목은 null을 돌려준다', () => {
    expect(mapMyApplicationListItem({ ...LIST_ITEM, status: 'DRAFT' })).toBeNull();
  });

  it('공고가 삭제되어 job이 없으면 대체 문구를 쓴다', () => {
    const item = mapMyApplicationListItem({ ...LIST_ITEM, job: null });
    expect(item?.companyName).toBe('삭제된 기업');
    expect(item?.jobTitle).toBe('삭제된 공고');
  });
});

describe('mapMyApplicationListItems', () => {
  it('DRAFT 항목만 걸러내고 나머지는 순서를 유지한다', () => {
    const items = mapMyApplicationListItems([
      LIST_ITEM,
      { ...LIST_ITEM, applicationId: 2, status: 'DRAFT' },
    ]);
    expect(items.map((item) => item.id)).toEqual(['1']);
  });
});

describe('mapMyApplicationHistory', () => {
  it('Action을 한글 라벨로 바꾼다', () => {
    const entries: MyApplicationHistoryEntry[] = [
      {
        historyId: 1,
        fromStatus: 'DRAFT',
        toStatus: 'SUBMITTED',
        action: 'SUBMIT',
        actorMemberId: 1,
        reason: null,
        createdAt: '2026-07-28T14:32:00',
      },
    ];
    expect(mapMyApplicationHistory(entries)).toEqual([
      { label: '지원서 제출', timestamp: '2026.07.28 14:32' },
    ]);
  });

  it('알 수 없는 Action은 원본 값을 그대로 라벨로 쓴다', () => {
    const entries: MyApplicationHistoryEntry[] = [
      {
        historyId: 1,
        fromStatus: 'DRAFT',
        toStatus: 'SUBMITTED',
        action: 'UNKNOWN_ACTION',
        actorMemberId: 1,
        reason: null,
        createdAt: '2026-07-28T14:32:00',
      },
    ];
    expect(mapMyApplicationHistory(entries)[0].label).toBe('UNKNOWN_ACTION');
  });
});

describe('mapMyApplicationDetail', () => {
  const DETAIL: MyApplicationDetailApiResponse = {
    applicationId: 1,
    jobId: 10,
    jobTitle: '프론트엔드 개발자',
    companyName: '토스페이먼츠',
    status: 'REVISION_REQUESTED',
    statusReason: '포트폴리오 링크를 추가해주세요.',
    answers: [{ fieldId: 'motivation', value: '지원 동기입니다.', fileIds: null }],
    files: [
      {
        fileId: 1,
        originalName: 'resume.pdf',
        contentType: 'application/pdf',
        size: 1024,
        downloadUrl: '/api/v1/files/1/download',
      },
    ],
    submittedAt: '2026-07-28T14:32:00',
    updatedAt: '2026-07-28T14:33:00',
    availableActions: ['WITHDRAW'],
  };

  it('보완 요청 상태면 statusReason을 revisionRequest 이유로 쓴다', () => {
    const detail = mapMyApplicationDetail(DETAIL, []);
    expect(detail.revisionRequest).toEqual({ reason: '포트폴리오 링크를 추가해주세요.' });
    expect(detail.isJobDeleted).toBe(false);
  });

  it('availableActions를 그대로 전달한다', () => {
    const detail = mapMyApplicationDetail(DETAIL, []);
    expect(detail.availableActions).toEqual(['WITHDRAW']);
  });

  it('보완 요청 상태가 아니면 revisionRequest가 없다', () => {
    const detail = mapMyApplicationDetail({ ...DETAIL, status: 'SUBMITTED' }, []);
    expect(detail.revisionRequest).toBeNull();
  });

  it('공고가 삭제되어 jobTitle이 없으면 isJobDeleted를 true로 표시한다', () => {
    const detail = mapMyApplicationDetail({ ...DETAIL, jobTitle: null, companyName: null }, []);
    expect(detail.isJobDeleted).toBe(true);
    expect(detail.jobTitle).toBe('삭제된 공고');
  });

  it('문항 텍스트가 없어 fieldId를 그대로 보여준다', () => {
    const detail = mapMyApplicationDetail(DETAIL, []);
    expect(detail.questions).toEqual([
      { id: 'motivation', order: '문항 1', question: 'motivation', answer: '지원 동기입니다.' },
    ]);
  });

  it('첨부파일 크기를 사람이 읽는 표기로 바꾼다', () => {
    const detail = mapMyApplicationDetail(DETAIL, []);
    expect(detail.attachments).toEqual([{ id: '1', fileName: 'resume.pdf', fileSize: '1.0 KB' }]);
  });
});
