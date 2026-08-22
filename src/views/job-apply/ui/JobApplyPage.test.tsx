import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  ApplicationQuestion,
  JobApplicationDraft,
  SaveJobApplicationDraftParams,
  UploadedApplicationFile,
} from '@/entities/job-application';

import { JobApplyPage } from './JobApplyPage';

const { mockCreateDraftMutate, mockSaveDraftMutate, mockActionMutate, mockUploadFileMutate } =
  vi.hoisted(() => ({
    mockCreateDraftMutate: vi.fn(),
    mockSaveDraftMutate: vi.fn(),
    mockActionMutate: vi.fn(),
    mockUploadFileMutate: vi.fn(),
  }));

vi.mock('@/entities/job-application', async () => {
  const actual = await vi.importActual<typeof import('@/entities/job-application')>(
    '@/entities/job-application',
  );
  return {
    ...actual,
    useCreateJobApplicationDraftMutation: () => ({ mutate: mockCreateDraftMutate }),
    useSaveJobApplicationDraftMutation: () => ({ mutate: mockSaveDraftMutate }),
    useJobApplicationActionMutation: () => ({ mutate: mockActionMutate }),
    useUploadApplicationFileMutation: () => ({ mutate: mockUploadFileMutate }),
  };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const TEXT_QUESTION: ApplicationQuestion = {
  fieldId: 'q-text',
  type: 'TEXT',
  title: '지원 동기',
  description: null,
  required: true,
  order: 1,
  options: null,
};

const FILE_QUESTION: ApplicationQuestion = {
  fieldId: 'q-file',
  type: 'FILE',
  title: '포트폴리오',
  description: 'PDF로 첨부해 주세요.',
  required: true,
  order: 2,
  options: null,
};

function baseDraft(overrides: Partial<JobApplicationDraft> = {}): JobApplicationDraft {
  return {
    applicationId: 1,
    jobId: 1,
    formId: 1,
    formVersion: 1,
    status: 'DRAFT',
    statusReason: null,
    contactEmail: 's20000@gsm.hs.kr',
    contactPhone: '010-0000-0000',
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

let currentDraft: JobApplicationDraft;

beforeEach(() => {
  vi.clearAllMocks();
  currentDraft = baseDraft();
  mockCreateDraftMutate.mockImplementation(
    (_jobId: number, options: { onSuccess: (draft: JobApplicationDraft) => void }) => {
      options.onSuccess(currentDraft);
    },
  );
  mockSaveDraftMutate.mockImplementation(
    (
      _params: SaveJobApplicationDraftParams,
      options: { onSuccess: (draft: JobApplicationDraft) => void },
    ) => {
      options.onSuccess(currentDraft);
    },
  );
  mockActionMutate.mockImplementation(
    (_params: unknown, options: { onSuccess: (draft: JobApplicationDraft) => void }) => {
      options.onSuccess(currentDraft);
    },
  );
  mockUploadFileMutate.mockImplementation(
    (file: File, options: { onSuccess: (uploaded: UploadedApplicationFile) => void }) => {
      // TanStack Query의 실제 mutate는 항상 비동기로 콜백을 실행한다 — 동기로 호출하면
      // handleAddFiles가 로컬 placeholder를 state에 반영하기도 전에 onSuccess가 먼저 실행돼
      // 매칭할 항목이 없는 채로 끝나 버린다(실제 동작과 다른 경합). 마이크로태스크로 미룬다.
      queueMicrotask(() =>
        options.onSuccess({
          fileId: 999,
          originalName: file.name,
          contentType: file.type,
          size: file.size,
          purpose: 'JOB_APPLICATION',
          createdAt: '2026-08-23T00:00:00Z',
        }),
      );
    },
  );
});

function renderPage() {
  render(<JobApplyPage jobId="1" backHref="/jobs/school/1" />);
}

describe('JobApplyPage', () => {
  it('공고에 설정된 문항을 실제로 답변할 수 있고, 임시저장 시 answers로 실어 보낸다', () => {
    currentDraft = baseDraft({ questions: [TEXT_QUESTION] });
    renderPage();

    fireEvent.change(screen.getAllByRole('textbox').at(-1)!, {
      target: { value: '성장하고 싶어 지원합니다' },
    });
    fireEvent.click(screen.getByRole('button', { name: '임시저장' }));

    expect(mockSaveDraftMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        answers: [{ fieldId: 'q-text', value: '성장하고 싶어 지원합니다', fileIds: null }],
      }),
      expect.anything(),
    );
  });

  it('필수 문항에 답하지 않고 제출하면 막히고 오류 테두리와 안내 문구가 표시된다', () => {
    currentDraft = baseDraft({ questions: [TEXT_QUESTION] });
    renderPage();
    fireEvent.click(screen.getByLabelText(/개인정보 수집 및 이용에 동의합니다/));

    fireEvent.click(screen.getByRole('button', { name: '제출하기' }));

    expect(mockActionMutate).not.toHaveBeenCalled();
    expect(screen.getByText('필수 항목을 모두 입력해 주세요.')).toBeInTheDocument();
    expect(screen.getAllByRole('textbox').at(-1)).toHaveClass('border-[#ef4444]');
  });

  it('필수 문항을 모두 채우고 동의하면 제출이 실행된다', async () => {
    currentDraft = baseDraft({ questions: [TEXT_QUESTION] });
    renderPage();

    fireEvent.change(screen.getAllByRole('textbox').at(-1)!, {
      target: { value: '지원 동기 답변' },
    });
    fireEvent.click(screen.getByLabelText(/개인정보 수집 및 이용에 동의합니다/));
    fireEvent.click(screen.getByRole('button', { name: '제출하기' }));

    await waitFor(() => expect(mockActionMutate).toHaveBeenCalled());
    expect(screen.getByText('제출이 완료되었습니다.')).toBeInTheDocument();
  });

  it('FILE 문항에 파일을 올리면 업로드된 fileId가 붙고, 임시저장 시 fileIds로 실어 보낸다', async () => {
    currentDraft = baseDraft({ questions: [FILE_QUESTION] });
    renderPage();

    expect(screen.getByRole('heading', { name: '포트폴리오' })).toBeInTheDocument();
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const uploadedFile = new File(['content'], 'portfolio.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [uploadedFile] } });

    expect(screen.getByText('portfolio.pdf')).toBeInTheDocument();
    // 업로드 mutate의 onSuccess가 마이크로태스크로 미뤄져 있으므로 act 안에서 한 틱 흘려보내
    // fileId가 실제로 state에 반영되게 한다.
    await act(async () => {
      await Promise.resolve();
    });

    fireEvent.click(screen.getByRole('button', { name: '임시저장' }));

    expect(mockSaveDraftMutate).toHaveBeenCalledWith(
      expect.objectContaining({
        answers: [{ fieldId: 'q-file', value: null, fileIds: [999] }],
      }),
      expect.anything(),
    );
  });

  it('형식에 맞지 않는 파일은 업로드 요청 없이 오류 사유만 보여준다', () => {
    currentDraft = baseDraft({ questions: [FILE_QUESTION] });
    renderPage();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const invalidFile = new File(['content'], 'malware.exe', { type: 'application/x-msdownload' });
    fireEvent.change(fileInput, { target: { files: [invalidFile] } });

    expect(screen.getByText('파일 형식 오류')).toBeInTheDocument();
    expect(mockUploadFileMutate).not.toHaveBeenCalled();
  });
});
