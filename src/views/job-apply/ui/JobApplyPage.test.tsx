import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type {
  ApplicationQuestion,
  JobApplicationDraft,
  SaveJobApplicationDraftParams,
  UploadedApplicationFile,
} from '@/entities/job-application';
import { ApiError } from '@/shared/api';

import { JobApplyPage } from './JobApplyPage';

function activeApplicationExistsError(): ApiError {
  return new ApiError('이미 활성 지원서가 있습니다.', 409, 'ACTIVE_APPLICATION_EXISTS');
}

const {
  mockCreateDraftMutate,
  mockResumeDraftMutate,
  mockSaveDraftMutate,
  mockActionMutate,
  mockUploadFileMutate,
} = vi.hoisted(() => ({
  mockCreateDraftMutate: vi.fn(),
  mockResumeDraftMutate: vi.fn(),
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
    useResumeJobApplicationDraftMutation: () => ({ mutate: mockResumeDraftMutate }),
    useSaveJobApplicationDraftMutation: () => ({ mutate: mockSaveDraftMutate }),
    useJobApplicationActionMutation: () => ({ mutate: mockActionMutate }),
    useUploadApplicationFileMutation: () => ({ mutate: mockUploadFileMutate }),
  };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/widgets/site-header', () => ({
  SiteHeader: () => <div data-testid="site-header" />,
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

const OPTIONAL_FILE_QUESTION: ApplicationQuestion = {
  fieldId: 'q-file-optional',
  type: 'FILE',
  title: '추가 자료',
  description: null,
  required: false,
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

  it('파일 업로드가 끝나기 전에 임시저장을 누르면 저장 요청을 보내지 않고 안내 토스트를 보여준다', () => {
    // 업로드 응답이 아직 오지 않은 상황(느린 네트워크)을 흉내낸다 — onSuccess/onError를 호출하지 않는다.
    mockUploadFileMutate.mockImplementation(() => {});
    currentDraft = baseDraft({ questions: [FILE_QUESTION] });
    renderPage();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const uploadedFile = new File(['content'], 'portfolio.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [uploadedFile] } });

    expect(screen.getByText('업로드 중')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '임시저장' }));

    expect(mockSaveDraftMutate).not.toHaveBeenCalled();
    expect(screen.getByText('파일 업로드가 끝난 후 다시 시도해 주세요.')).toBeInTheDocument();
  });

  it('파일 업로드가 끝나기 전에 제출하면 막히고 안내 문구가 표시된다', () => {
    // 필수 문항은 아니지만, 업로드 중인 파일이 있으면 제출 자체를 막아야 한다 — 필수 문항
    // 미입력 검사와 분리해서 확인하기 위해 선택 문항을 쓴다.
    mockUploadFileMutate.mockImplementation(() => {});
    currentDraft = baseDraft({ questions: [OPTIONAL_FILE_QUESTION] });
    renderPage();
    fireEvent.click(screen.getByLabelText(/개인정보 수집 및 이용에 동의합니다/));

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const uploadedFile = new File(['content'], 'portfolio.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [uploadedFile] } });

    fireEvent.click(screen.getByRole('button', { name: '제출하기' }));

    expect(mockSaveDraftMutate).not.toHaveBeenCalled();
    expect(mockActionMutate).not.toHaveBeenCalled();
    expect(screen.getByText('파일 업로드가 끝난 후 다시 시도해 주세요.')).toBeInTheDocument();
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

  it('개수 제한에 걸려 거부된 파일은 다음 업로드의 개수 제한에 포함되지 않는다', () => {
    currentDraft = baseDraft({ questions: [FILE_QUESTION] });
    renderPage();

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    // MAX_ATTACHMENT_COUNT(5)만큼 형식 오류 파일을 올려 목록에 오류 항목 5개를 쌓는다.
    const invalidFiles = Array.from(
      { length: 5 },
      (_, index) =>
        new File(['content'], `malware-${index}.exe`, { type: 'application/x-msdownload' }),
    );
    fireEvent.change(fileInput, { target: { files: invalidFiles } });
    expect(screen.getAllByText('파일 형식 오류')).toHaveLength(5);

    // 실제 정상 첨부는 0개이므로, 유효한 파일을 추가로 올리면 개수 제한 없이 업로드가 실행돼야 한다.
    const validFile = new File(['content'], 'portfolio.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [validFile] } });

    expect(mockUploadFileMutate).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('개수 초과')).not.toBeInTheDocument();
  });

  it('이미 활성 지원서가 있으면(409) 기존 임시저장을 불러와 이어서 작성한다', async () => {
    mockCreateDraftMutate.mockImplementation(
      (_jobId: number, options: { onError: (error: unknown) => void }) => {
        options.onError(activeApplicationExistsError());
      },
    );
    mockResumeDraftMutate.mockImplementation(
      (_jobId: number, options: { onSuccess: (draft: JobApplicationDraft | null) => void }) => {
        options.onSuccess(
          baseDraft({
            applicationId: 42,
            questions: [TEXT_QUESTION],
            answers: [{ fieldId: 'q-text', value: '이어서 작성 중인 답변', fileIds: null }],
          }),
        );
      },
    );

    renderPage();

    expect(mockResumeDraftMutate).toHaveBeenCalledWith(1, expect.anything());
    expect(await screen.findByDisplayValue('이어서 작성 중인 답변')).toBeInTheDocument();
    expect(screen.queryByText('이미 작성 중인 지원서가 있습니다.')).not.toBeInTheDocument();
  });

  it('409인데 임시저장이 없으면(제출·철회로 넘어감) 기존 안내로 폴백한다', () => {
    mockCreateDraftMutate.mockImplementation(
      (_jobId: number, options: { onError: (error: unknown) => void }) => {
        options.onError(activeApplicationExistsError());
      },
    );
    mockResumeDraftMutate.mockImplementation(
      (_jobId: number, options: { onSuccess: (draft: JobApplicationDraft | null) => void }) => {
        options.onSuccess(null);
      },
    );

    renderPage();

    expect(screen.getByText('이미 작성 중인 지원서가 있습니다.')).toBeInTheDocument();
  });

  it('409 후 기존 초안 재조회 자체가 실패하면 오류 안내를 표시한다', () => {
    mockCreateDraftMutate.mockImplementation(
      (_jobId: number, options: { onError: (error: unknown) => void }) => {
        options.onError(activeApplicationExistsError());
      },
    );
    mockResumeDraftMutate.mockImplementation(
      (_jobId: number, options: { onError: (error: unknown) => void }) => {
        options.onError(new Error('network'));
      },
    );

    renderPage();

    expect(screen.getByText('지원서를 불러오지 못했습니다.')).toBeInTheDocument();
    expect(screen.queryByText('이미 작성 중인 지원서가 있습니다.')).not.toBeInTheDocument();
  });
});
