import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '@/shared/api';

import { AdminCompanyManagement } from './AdminCompanyManagement';

const { fetchCompanyList, fetchCompanyDetail, createCompany, updateCompany } = vi.hoisted(() => ({
  fetchCompanyList: vi.fn(),
  fetchCompanyDetail: vi.fn(),
  createCompany: vi.fn(),
  updateCompany: vi.fn(),
}));

vi.mock('@/entities/company/api/companyApi', () => ({
  fetchCompanyList,
  fetchCompanyDetail,
  createCompany,
  updateCompany,
}));

const LIST_RESPONSE = {
  content: [
    {
      companyId: 1,
      name: '플로우테크',
      companyType: 'GENERAL',
      mouStatus: 'ACTIVE',
      logoUrl: null,
    },
    {
      companyId: 2,
      name: '네오스튜디오',
      companyType: 'FOREIGN',
      mouStatus: 'NONE',
      logoUrl: null,
    },
  ],
  page: 0,
  size: 100,
  totalElements: 2,
  totalPages: 1,
  first: true,
  last: true,
};

function renderWithQueryClient(ui: ReactNode) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('AdminCompanyManagement', () => {
  beforeEach(() => {
    fetchCompanyList.mockReset();
    fetchCompanyDetail.mockReset();
    createCompany.mockReset();
    updateCompany.mockReset();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('로딩 상태를 표시한 뒤 목록을 렌더링한다', async () => {
    fetchCompanyList.mockResolvedValue(LIST_RESPONSE);

    renderWithQueryClient(<AdminCompanyManagement />);

    expect(screen.getByText('정보를 불러오는 중입니다.')).toBeInTheDocument();

    await waitFor(() => expect(screen.getByText('플로우테크')).toBeInTheDocument());
    expect(screen.getByText('네오스튜디오')).toBeInTheDocument();
    expect(screen.getByText('총 2개 기업')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '삭제' })).not.toBeInTheDocument();
  });

  it('목록 조회가 실패하면 에러 상태를 표시하고, 다시 시도를 누르면 재조회한다', async () => {
    fetchCompanyList.mockRejectedValueOnce(new ApiError('서버 오류', 500));
    fetchCompanyList.mockResolvedValueOnce(LIST_RESPONSE);

    renderWithQueryClient(<AdminCompanyManagement />);

    await waitFor(() =>
      expect(screen.getByText('기업 정보를 불러오지 못했습니다.')).toBeInTheDocument(),
    );

    await userEvent.click(screen.getByRole('button', { name: '다시 시도' }));

    await waitFor(() => expect(screen.getByText('플로우테크')).toBeInTheDocument());
  });

  it('기업이 하나도 없으면 빈 상태를 표시한다', async () => {
    fetchCompanyList.mockResolvedValue({ ...LIST_RESPONSE, content: [], totalElements: 0 });

    renderWithQueryClient(<AdminCompanyManagement />);

    await waitFor(() => expect(screen.getByText('등록된 기업이 없습니다.')).toBeInTheDocument());
  });

  it('기업명으로 검색하면 검색어를 쿼리 파라미터로 전달한다', async () => {
    fetchCompanyList.mockResolvedValue(LIST_RESPONSE);

    renderWithQueryClient(<AdminCompanyManagement />);
    await waitFor(() => expect(screen.getByText('플로우테크')).toBeInTheDocument());

    await userEvent.type(screen.getByPlaceholderText('기업명으로 검색해 보세요.'), '네오');

    await waitFor(() =>
      expect(fetchCompanyList).toHaveBeenLastCalledWith(expect.objectContaining({ query: '네오' })),
    );
  });

  it('기업 등록 버튼을 누르고 필수 항목을 입력하면 등록 API를 호출하고 완료 모달을 보여준다', async () => {
    fetchCompanyList.mockResolvedValue(LIST_RESPONSE);
    createCompany.mockResolvedValue({ companyId: 3, name: '테스트기업' });

    renderWithQueryClient(<AdminCompanyManagement />);
    await waitFor(() => expect(screen.getByText('플로우테크')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: '기업 등록' }));
    const panel = screen.getByRole('dialog', { name: '기업 등록' });

    await userEvent.type(screen.getByPlaceholderText('기업명을 입력해 주세요.'), '테스트기업');
    await userEvent.selectOptions(
      within(panel).getByDisplayValue('기업 유형을 선택해 주세요.'),
      '일반기업',
    );
    await userEvent.type(screen.getByLabelText('MOU 시작일'), '2026-01-01');
    await userEvent.type(screen.getByLabelText('MOU 종료일'), '2027-01-01');

    await userEvent.click(within(panel).getByRole('button', { name: '등록하기' }));

    const confirmDialog = screen.getByRole('dialog', { name: '기업을 등록할까요?' });
    expect(within(confirmDialog).getByText('테스트기업')).toBeInTheDocument();
    await userEvent.click(within(confirmDialog).getByRole('button', { name: '등록하기' }));

    await waitFor(() =>
      expect(createCompany).toHaveBeenCalledWith(
        expect.objectContaining({
          name: '테스트기업',
          companyType: 'GENERAL',
          sourceName: 'manual',
        }),
      ),
    );
    await waitFor(() =>
      expect(screen.getByText('기업 등록이 완료되었습니다.')).toBeInTheDocument(),
    );
  });

  it('수정 버튼을 누르면 상세 조회 후 값이 채워진 패널이 열리고, 확정하면 수정 API를 호출한다', async () => {
    fetchCompanyList.mockResolvedValue(LIST_RESPONSE);
    fetchCompanyDetail.mockResolvedValue({
      companyId: 1,
      name: '플로우테크',
      companyType: 'GENERAL',
      mouStatus: 'ACTIVE',
      sourceName: 'manual',
      homepageUrl: null,
      logoUrl: null,
      description: '기존 설명',
      industry: null,
      address: null,
      mouStartDate: '2025-03-01',
      mouEndDate: '2027-02-28',
      createdAt: '2025-01-01T00:00:00',
      updatedAt: '2025-01-01T00:00:00',
    });
    updateCompany.mockResolvedValue({ companyId: 1, name: '플로우테크(수정)' });

    renderWithQueryClient(<AdminCompanyManagement />);
    await waitFor(() => expect(screen.getByText('플로우테크')).toBeInTheDocument());

    await userEvent.click(screen.getAllByRole('button', { name: '수정' })[0]);

    await waitFor(() => expect(fetchCompanyDetail).toHaveBeenCalledWith(1));
    const panel = await screen.findByRole('dialog', { name: '기업 수정' });
    expect(within(panel).getByDisplayValue('플로우테크')).toBeInTheDocument();
    expect(within(panel).getByDisplayValue('기존 설명')).toBeInTheDocument();

    await userEvent.click(within(panel).getByRole('button', { name: '수정하기' }));

    const confirmDialog = screen.getByRole('dialog', { name: '변경사항을 저장할까요?' });
    await userEvent.click(within(confirmDialog).getByRole('button', { name: '변경사항 저장' }));

    await waitFor(() =>
      expect(updateCompany).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: 1,
          payload: expect.objectContaining({ name: '플로우테크' }),
        }),
      ),
    );
    await waitFor(() =>
      expect(screen.getByText('기업 수정이 완료되었습니다.')).toBeInTheDocument(),
    );
  });

  it('등록 API가 실패하면 오류 토스트를 표시한다', async () => {
    fetchCompanyList.mockResolvedValue(LIST_RESPONSE);
    createCompany.mockRejectedValue(new ApiError('이미 등록된 기업입니다.', 409));

    renderWithQueryClient(<AdminCompanyManagement />);
    await waitFor(() => expect(screen.getByText('플로우테크')).toBeInTheDocument());

    await userEvent.click(screen.getByRole('button', { name: '기업 등록' }));
    const panel = screen.getByRole('dialog', { name: '기업 등록' });
    await userEvent.type(screen.getByPlaceholderText('기업명을 입력해 주세요.'), '중복기업');
    await userEvent.selectOptions(
      within(panel).getByDisplayValue('기업 유형을 선택해 주세요.'),
      '일반기업',
    );
    await userEvent.type(screen.getByLabelText('MOU 시작일'), '2026-01-01');
    await userEvent.type(screen.getByLabelText('MOU 종료일'), '2027-01-01');
    await userEvent.click(within(panel).getByRole('button', { name: '등록하기' }));
    const confirmDialog = screen.getByRole('dialog', { name: '기업을 등록할까요?' });
    await userEvent.click(within(confirmDialog).getByRole('button', { name: '등록하기' }));

    await waitFor(() => expect(screen.getByText('이미 등록된 기업입니다.')).toBeInTheDocument());
    expect(screen.getByRole('dialog', { name: '기업 등록' })).toBeInTheDocument();
    expect(screen.getByDisplayValue('중복기업')).toBeInTheDocument();
  });
});
