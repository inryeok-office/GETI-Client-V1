import type { JobApplicationDraft } from '@/entities/job-application';
import { describe, expect, it } from 'vitest';

import { buildInitialAnswerState } from './buildInitialAnswerState';

function draft(overrides: Partial<JobApplicationDraft> = {}): JobApplicationDraft {
  return {
    applicationId: 1,
    jobId: 1,
    formId: 1,
    formVersion: 1,
    status: 'DRAFT',
    statusReason: null,
    contactEmail: 's20000@gsm.hs.kr',
    contactPhone: null,
    privacyConsent: false,
    applicantName: '홍길동',
    applicantCohort: 10,
    applicantDepartment: '소프트웨어개발과',
    applicantMajors: [],
    applicantDesiredJob: null,
    applicantTechStacks: [],
    questions: [],
    answers: [],
    files: [],
    submittedAt: null,
    withdrawnAt: null,
    createdAt: '2026-08-23T00:00:00Z',
    updatedAt: '2026-08-23T00:00:00Z',
    ...overrides,
  };
}

describe('buildInitialAnswerState', () => {
  it('TEXT · TEXTAREA · SINGLE_SELECT 답변은 문자열 값으로 복원한다', () => {
    const { values } = buildInitialAnswerState(
      draft({
        questions: [
          {
            fieldId: 'q1',
            type: 'TEXT',
            title: '이름',
            description: null,
            required: true,
            order: 1,
            options: null,
          },
        ],
        answers: [{ fieldId: 'q1', value: '지원 동기입니다', fileIds: null }],
      }),
    );

    expect(values).toEqual({ q1: '지원 동기입니다' });
  });

  it('MULTI_SELECT 답변은 배열로 복원하고, 배열이 아니면 빈 배열로 취급한다', () => {
    const { values } = buildInitialAnswerState(
      draft({
        questions: [
          {
            fieldId: 'q1',
            type: 'MULTI_SELECT',
            title: '기술 스택',
            description: null,
            required: false,
            order: 1,
            options: ['React', 'Vue'],
          },
        ],
        answers: [{ fieldId: 'q1', value: 'React', fileIds: null }],
      }),
    );

    expect(values).toEqual({ q1: [] });
  });

  it('FILE 답변은 fileIds를 files 메타데이터와 대조해 첨부 목록으로 복원한다', () => {
    const { attachmentsByFieldId } = buildInitialAnswerState(
      draft({
        questions: [
          {
            fieldId: 'q1',
            type: 'FILE',
            title: '포트폴리오',
            description: null,
            required: true,
            order: 1,
            options: null,
          },
        ],
        answers: [{ fieldId: 'q1', value: null, fileIds: [10, 20] }],
        files: [
          {
            fileId: 10,
            originalName: 'resume.pdf',
            contentType: 'application/pdf',
            size: 2048,
            downloadUrl: '/f/10',
          },
          {
            fileId: 20,
            originalName: 'portfolio.png',
            contentType: 'image/png',
            size: 4096,
            downloadUrl: '/f/20',
          },
        ],
      }),
    );

    expect(attachmentsByFieldId.q1).toEqual([
      { id: 'file-10', fileName: 'resume.pdf', fileSize: '2.0 KB', uploadError: null, fileId: 10 },
      {
        id: 'file-20',
        fileName: 'portfolio.png',
        fileSize: '4.0 KB',
        uploadError: null,
        fileId: 20,
      },
    ]);
  });

  it('questions에 없는 fieldId의 답변은 건너뛴다', () => {
    const { values, attachmentsByFieldId } = buildInitialAnswerState(
      draft({
        questions: [],
        answers: [{ fieldId: 'stale', value: '값', fileIds: null }],
      }),
    );

    expect(values).toEqual({});
    expect(attachmentsByFieldId).toEqual({});
  });
});
