import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { CommonFileUploadResponse } from '@/entities/common-file';
import { ApiError } from '@/shared/api';

import { ProfileOnboardingPage } from './ProfileOnboardingPage';

const {
  mockCompleteMutateAsync,
  mockMajorRefetch,
  mockRouterReplace,
  mockTechStackRefetch,
  mockUploadMutate,
  mockUseCompleteProfileMutation,
  mockUseMajorMetadataQuery,
  mockUseTechStackMetadataQuery,
  mockUseUploadProfileImageMutation,
} = vi.hoisted(() => ({
  mockCompleteMutateAsync: vi.fn(),
  mockMajorRefetch: vi.fn(),
  mockRouterReplace: vi.fn(),
  mockTechStackRefetch: vi.fn(),
  mockUploadMutate: vi.fn(),
  mockUseCompleteProfileMutation: vi.fn(),
  mockUseMajorMetadataQuery: vi.fn(),
  mockUseTechStackMetadataQuery: vi.fn(),
  mockUseUploadProfileImageMutation: vi.fn(),
}));

vi.mock('@/entities/member', async () => {
  const actual = await vi.importActual<typeof import('@/entities/member')>('@/entities/member');
  return {
    ...actual,
    useMajorMetadataQuery: mockUseMajorMetadataQuery,
    useTechStackMetadataQuery: mockUseTechStackMetadataQuery,
  };
});

vi.mock('@/features/complete-profile', () => ({
  useCompleteProfileMutation: mockUseCompleteProfileMutation,
  useUploadProfileImageMutation: mockUseUploadProfileImageMutation,
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: mockRouterReplace }),
}));

const MAJORS = [
  { majorId: 1, name: '백엔드', active: true },
  { majorId: 2, name: '디자인', active: true },
];
const TECH_STACKS = [
  { techStackId: 10, name: 'React', category: 'FRONTEND' as const },
  { techStackId: 11, name: 'Figma', category: 'ETC' as const },
];
const UPLOADED_IMAGE: CommonFileUploadResponse = {
  fileId: 77,
  originalName: 'profile.png',
  contentType: 'image/png',
  size: 1024,
  purpose: 'PROFILE_IMAGE',
  createdAt: '2026-08-24T00:00:00Z',
};

interface UploadCallbacks {
  onError: (error: unknown) => void;
  onSuccess: (uploadedFile: CommonFileUploadResponse) => void;
}

function queryResult(data: typeof MAJORS | typeof TECH_STACKS) {
  return {
    data,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  };
}

function uploadImage(file = new File(['image'], 'profile.png', { type: 'image/png' })) {
  fireEvent.change(screen.getByLabelText('프로필 이미지 파일'), {
    target: { files: [file] },
  });
}

function fillRequiredFields() {
  uploadImage();
  fireEvent.click(screen.getByRole('button', { name: '10기' }));
  fireEvent.click(screen.getByRole('button', { name: '스마트IoT과' }));
  fireEvent.click(screen.getByRole('option', { name: '디자인' }));
  fireEvent.change(screen.getByLabelText('희망 직무/관심 직무 *'), {
    target: { value: 'UXUI 디자이너' },
  });
  fireEvent.change(screen.getByLabelText('기술 스택 *'), { target: { value: 'Figma' } });
  fireEvent.click(screen.getByRole('option', { name: 'Figma' }));
}

beforeEach(() => {
  mockUseMajorMetadataQuery.mockReturnValue({
    ...queryResult(MAJORS),
    refetch: mockMajorRefetch,
  });
  mockUseTechStackMetadataQuery.mockReturnValue({
    ...queryResult(TECH_STACKS),
    refetch: mockTechStackRefetch,
  });
  mockUseUploadProfileImageMutation.mockReturnValue({
    mutate: mockUploadMutate,
    isPending: false,
  });
  mockUseCompleteProfileMutation.mockReturnValue({
    mutateAsync: mockCompleteMutateAsync,
    isPending: false,
  });
  mockUploadMutate.mockImplementation((_file: File, callbacks: UploadCallbacks) => {
    callbacks.onSuccess(UPLOADED_IMAGE);
  });
  mockCompleteMutateAsync.mockResolvedValue({ memberId: 1, roles: ['STUDENT'] });
  mockRouterReplace.mockReset();
  mockMajorRefetch.mockReset();
  mockTechStackRefetch.mockReset();
  mockUploadMutate.mockClear();
  mockCompleteMutateAsync.mockClear();
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: vi.fn(() => 'blob:profile-preview'),
  });
  Object.defineProperty(URL, 'revokeObjectURL', {
    configurable: true,
    value: vi.fn(),
  });
});

describe('ProfileOnboardingPage', () => {
  it('최초 프로필 입력 항목과 서버 메타데이터를 표시한다', () => {
    render(<ProfileOnboardingPage />);

    expect(screen.getByRole('heading', { name: '프로필을 완성해 주세요' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '백엔드' })).toBeInTheDocument();
    expect(screen.getByLabelText('기술 스택 *')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '프로필 등록 완료' })).toBeInTheDocument();
  });

  it('메타데이터의 로딩 상태를 표시한다', () => {
    mockUseMajorMetadataQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      refetch: mockMajorRefetch,
    });

    render(<ProfileOnboardingPage />);

    expect(screen.getByRole('status')).toHaveTextContent('프로필 선택 정보를 불러오는 중입니다.');
    expect(screen.getByRole('button', { name: '전공을 선택하세요.' })).toBeDisabled();
  });

  it('메타데이터 조회 실패 메시지를 표시하고 실패한 요청을 다시 시도한다', () => {
    mockUseTechStackMetadataQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      refetch: mockTechStackRefetch,
    });

    render(<ProfileOnboardingPage />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      '프로필 선택 정보를 불러오지 못했습니다.',
    );
    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(mockTechStackRefetch).toHaveBeenCalledOnce();
    expect(mockMajorRefetch).not.toHaveBeenCalled();
  });

  it('선택 가능한 메타데이터가 없으면 빈 상태와 비활성화된 등록 버튼을 표시한다', () => {
    mockUseMajorMetadataQuery.mockReturnValue({
      ...queryResult([]),
      refetch: mockMajorRefetch,
    });

    render(<ProfileOnboardingPage />);

    expect(screen.getByRole('alert')).toHaveTextContent(
      '선택 가능한 전공 또는 기술 스택이 없습니다.',
    );
    expect(screen.getByRole('button', { name: '프로필 등록 완료' })).toBeDisabled();
  });

  it('필수값이 비어 있으면 API를 호출하지 않고 입력별 오류를 표시한다', () => {
    render(<ProfileOnboardingPage />);
    fireEvent.click(screen.getByRole('button', { name: '프로필 등록 완료' }));

    expect(screen.getByText('프로필 이미지를 등록해 주세요.')).toBeInTheDocument();
    expect(screen.getByText('기수를 선택해 주세요.')).toBeInTheDocument();
    expect(screen.getByText('기술 스택을 추가해 주세요.')).toBeInTheDocument();
    expect(mockCompleteMutateAsync).not.toHaveBeenCalled();
  });

  it.each([
    ['지원하지 않는 형식', new File(['document'], 'profile.pdf', { type: 'application/pdf' })],
    ['지원하지 않는 확장자', new File(['image'], 'profile.jpeg', { type: 'image/jpeg' })],
    ['확장자와 형식 불일치', new File(['image'], 'profile.jpg', { type: 'image/png' })],
    [
      '5MB 초과',
      new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'profile.png', { type: 'image/png' }),
    ],
  ])('%s 파일은 업로드 전에 거부한다', (_caseName, file) => {
    render(<ProfileOnboardingPage />);
    uploadImage(file);

    expect(
      screen.getByText('지원하지 않는 파일입니다. JPG, PNG / 5MB 이하만 업로드 가능합니다.'),
    ).toBeInTheDocument();
    expect(mockUploadMutate).not.toHaveBeenCalled();
  });

  it('파일 업로드 실패 상태를 표시하고 사진을 다시 선택할 수 있다', () => {
    mockUploadMutate.mockImplementationOnce((_file: File, callbacks: UploadCallbacks) => {
      callbacks.onError(new ApiError('storage error', 500, 'FILE_STORAGE_ERROR'));
    });
    render(<ProfileOnboardingPage />);
    uploadImage();

    expect(screen.getByText('업로드에 실패했습니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '사진 등록' })).toBeEnabled();
  });

  it('전화번호 형식이 잘못되면 등록을 막는다', () => {
    render(<ProfileOnboardingPage />);
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText('전화번호 (선택)'), {
      target: { value: '01012345678' },
    });
    fireEvent.click(screen.getByRole('button', { name: '프로필 등록 완료' }));

    expect(
      screen.getByText('전화번호를 010-0000-0000 형식으로 입력해 주세요.'),
    ).toBeInTheDocument();
    expect(mockCompleteMutateAsync).not.toHaveBeenCalled();
  });

  it('등록 중에는 중복 제출과 입력 변경을 막는다', () => {
    mockUseCompleteProfileMutation.mockReturnValue({
      mutateAsync: mockCompleteMutateAsync,
      isPending: true,
    });
    render(<ProfileOnboardingPage />);

    expect(screen.getByRole('button', { name: '프로필 등록 중' })).toBeDisabled();
    expect(screen.getByLabelText('희망 직무/관심 직무 *')).toBeDisabled();
    expect(screen.getByRole('button', { name: '사진 등록' })).toBeDisabled();
  });

  it('입력값을 저장하고 세션 갱신 성공 후 공고 목록으로 이동한다', async () => {
    render(<ProfileOnboardingPage />);
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText('전화번호 (선택)'), {
      target: { value: '010-1234-5678' },
    });
    fireEvent.click(screen.getByRole('button', { name: '프로필 등록 완료' }));

    await waitFor(() => {
      expect(mockCompleteMutateAsync).toHaveBeenCalledWith({
        department: 'SMART_IOT',
        desiredJob: 'UXUI 디자이너',
        majorIds: [2],
        phone: '010-1234-5678',
        profileImageFileId: 77,
        techStackIds: [11],
      });
    });
    expect(mockRouterReplace).toHaveBeenCalledWith('/jobs');
  });

  it('서버 필드 검증 오류를 해당 입력에 표시하고 이동하지 않는다', async () => {
    mockCompleteMutateAsync.mockRejectedValueOnce(
      new ApiError('validation failed', 400, 'PROFILE_VALIDATION_FAILED', [
        { field: 'desiredJob', message: '희망 직무를 확인해 주세요.' },
      ]),
    );
    render(<ProfileOnboardingPage />);
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: '프로필 등록 완료' }));

    expect(await screen.findByText('희망 직무를 확인해 주세요.')).toBeInTheDocument();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });
});
