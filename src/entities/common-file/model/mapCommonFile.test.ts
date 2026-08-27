import { describe, expect, it } from 'vitest';

import type { CommonFileApiItem } from './types';
import { mapCommonFile } from './mapCommonFile';

const FILE: CommonFileApiItem = {
  contentType: 'application/pdf',
  createdAt: '2026-08-20T09:00:00',
  fileId: 42,
  originalName: '이력서.pdf',
  ownerId: 15,
  ownerType: 'JOB_APPLICATION',
  purpose: 'JOB_APPLICATION',
  sizeBytes: 204_800,
  status: 'LINKED',
  uploader: { memberId: 7, name: '홍길동' },
};

describe('mapCommonFile', () => {
  it('관리자 파일 응답을 화면 모델로 변환한다', () => {
    expect(mapCommonFile(FILE)).toEqual({
      fileId: 42,
      isDownloadAvailable: true,
      name: '이력서.pdf',
      purpose: 'JOB_APPLICATION',
      size: '200KB',
      status: 'LINKED',
      uploader: '홍길동',
      uploadedAt: '2026.08.20',
      usage: '지원서 #15',
    });
  });

  it('연결되지 않은 파일과 알 수 없는 업로더를 안전하게 표시한다', () => {
    expect(
      mapCommonFile({
        ...FILE,
        ownerId: null,
        ownerType: null,
        status: 'FAILED',
        uploader: { memberId: 8, name: null },
      }),
    ).toMatchObject({ isDownloadAvailable: false, uploader: '회원 #8', usage: '연결 전' });
  });

  it.each([
    ['PENDING', false],
    ['UPLOADED', true],
    ['LINKED', true],
    ['FAILED', false],
    ['DELETED', false],
  ] as const)('%s 상태의 다운로드 요청 가능 여부를 변환한다', (status, expected) => {
    expect(mapCommonFile({ ...FILE, status }).isDownloadAvailable).toBe(expected);
  });
});
