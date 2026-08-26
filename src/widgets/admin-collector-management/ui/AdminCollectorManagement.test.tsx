import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type {
  CollectorRunDetail,
  CollectorRunSummary,
  JobSourceApiItem,
} from '@/entities/collector';

import { AdminCollectorManagement } from './AdminCollectorManagement';

const RUNS: CollectorRunSummary[] = [
  {
    runId: 1,
    sourceName: 'JOB-ALIO',
    executedAt: '2026.08.01 09:00:12',
    status: 'PARTIAL_SUCCESS',
    createdCount: 24,
    updatedCount: 18,
    failedCount: 3,
    hasErrors: true,
  },
  {
    runId: 2,
    sourceName: '사람인',
    executedAt: '2026.08.01 08:30:05',
    status: 'SUCCESS',
    createdCount: null,
    updatedCount: 12,
    failedCount: 0,
    hasErrors: false,
  },
];

const DETAIL: CollectorRunDetail = {
  ...RUNS[0],
  errorSummary: [
    {
      title: 'SOURCE_TIMEOUT',
      description: '수집원 응답 시간이 초과되었습니다.',
    },
  ],
};

const SOURCES: JobSourceApiItem[] = [
  {
    approvalStatus: 'READY',
    configured: true,
    dailyRequestLimit: 100,
    enabled: true,
    lastCollectedAt: '2026-08-01T09:00:00',
    lastError: null,
    lastFailureAt: null,
    lastSuccessAt: '2026-08-01T09:03:00',
    name: 'JOB-ALIO',
    sourceCode: 'JOB_ALIO',
    sourceId: 2,
    sourceType: 'EXTERNAL_API',
  },
];

function renderManagement(
  overrides: Partial<React.ComponentProps<typeof AdminCollectorManagement>> = {},
) {
  const props: React.ComponentProps<typeof AdminCollectorManagement> = {
    action: 'COLLECT',
    detailStatus: 'idle',
    endDate: '',
    hasDateRangeError: false,
    isActionPending: false,
    isSourceUpdatePending: false,
    isDetailOpen: false,
    isFirstPage: true,
    isLastPage: true,
    listStatus: 'success',
    onActionChange: vi.fn(),
    onCloseDetail: vi.fn(),
    onEndDateChange: vi.fn(),
    onExecuteAction: vi.fn(),
    onPageChange: vi.fn(),
    onRetryDetail: vi.fn(),
    onRetryList: vi.fn(),
    onRetrySources: vi.fn(),
    onSelectRun: vi.fn(),
    onSourceFilterChange: vi.fn(),
    onStartDateChange: vi.fn(),
    onStatusFilterChange: vi.fn(),
    onToggleSource: vi.fn(),
    onToggleSourceSelection: vi.fn(),
    page: 0,
    pendingSourceId: undefined,
    runs: RUNS,
    selectedRun: null,
    selectedSourceIds: [],
    sourceFilter: null,
    sourceStatus: 'success',
    sources: SOURCES,
    startDate: '',
    statusFilter: 'ALL',
    totalPages: 1,
    ...overrides,
  };

  render(<AdminCollectorManagement {...props} />);
  return props;
}

describe('AdminCollectorManagement', () => {
  it('서버 실행 이력과 집계 불가 값을 표시한다', () => {
    renderManagement();

    expect(screen.getByRole('heading', { name: '외부 수집 관리' })).toBeInTheDocument();
    expect(screen.getByText('2026.08.01 09:03')).toBeInTheDocument();
    expect(screen.getByText('일부 실패')).toBeInTheDocument();
    expect(screen.getByText('오류 없음')).toBeInTheDocument();
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('상세 보기를 누르면 해당 실행 ID를 전달한다', () => {
    const props = renderManagement();

    fireEvent.click(screen.getByRole('button', { name: '상세 보기' }));
    expect(props.onSelectRun).toHaveBeenCalledWith(1);
  });

  it('진행 중인 실행은 오류 없음으로 단정하지 않고 상세를 열 수 있다', () => {
    const runningRun: CollectorRunSummary = {
      ...RUNS[1],
      runId: 3,
      status: 'RUNNING',
    };
    const props = renderManagement({ runs: [runningRun] });

    expect(screen.queryByText('오류 없음')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '상세 보기' }));
    expect(props.onSelectRun).toHaveBeenCalledWith(3);
  });

  it('진행 중인 실행 상세에는 자동 갱신 안내를 표시한다', () => {
    const runningDetail: CollectorRunDetail = {
      ...DETAIL,
      errorSummary: [],
      status: 'RUNNING',
    };

    renderManagement({
      detailStatus: 'success',
      isDetailOpen: true,
      selectedRun: runningDetail,
    });

    expect(
      screen.getByText('작업이 진행 중이며 완료될 때까지 자동으로 갱신됩니다.'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('정상 처리된 공고는 서비스에 반영되었습니다.'),
    ).not.toBeInTheDocument();
  });

  it('취소된 실행은 오류 없음 대신 취소 상태를 표시한다', () => {
    renderManagement({ runs: [{ ...RUNS[1], status: 'CANCELED' }] });

    expect(screen.getByText('취소됨')).toBeInTheDocument();
    expect(screen.queryByText('오류 없음')).not.toBeInTheDocument();
  });

  it('수집원 선택·활성 상태 변경과 수동 실행을 전달한다', () => {
    const props = renderManagement({ selectedSourceIds: [2] });

    fireEvent.click(screen.getByRole('checkbox', { name: 'JOB-ALIO 실행 대상 선택' }));
    fireEvent.click(screen.getByRole('switch', { name: 'JOB-ALIO 활성 상태' }));
    fireEvent.click(screen.getByRole('button', { name: '선택 수집원 실행' }));

    expect(props.onToggleSourceSelection).toHaveBeenCalledWith(2);
    expect(props.onToggleSource).toHaveBeenCalledWith(2, false);
    expect(props.onExecuteAction).toHaveBeenCalledOnce();
  });

  it('변경 요청 중에는 중복 수집원 조작을 막는다', () => {
    renderManagement({ isActionPending: true, pendingSourceId: 2, selectedSourceIds: [2] });

    expect(screen.getByRole('combobox', { name: '실행 종류' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'JOB-ALIO 실행 대상 선택' })).toBeDisabled();
    expect(screen.getByRole('switch', { name: 'JOB-ALIO 활성 상태' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '선택 수집원 실행' })).toBeDisabled();
  });

  it('수집원 상태 변경 중에는 수동 실행 조작도 함께 막는다', () => {
    renderManagement({ isSourceUpdatePending: true, pendingSourceId: 2, selectedSourceIds: [2] });

    expect(screen.getByRole('combobox', { name: '실행 종류' })).toBeDisabled();
    expect(screen.getByRole('checkbox', { name: 'JOB-ALIO 실행 대상 선택' })).toBeDisabled();
    expect(screen.getByRole('switch', { name: 'JOB-ALIO 활성 상태' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '선택 수집원 실행' })).toBeDisabled();
  });

  it('수집원 조회가 성공하지 않으면 수동 실행 조작을 막는다', () => {
    renderManagement({ sourceStatus: 'error', sources: [], selectedSourceIds: [2] });

    expect(screen.getByRole('combobox', { name: '실행 종류' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '선택 수집원 실행' })).toBeDisabled();
  });

  it('실행 이력 페이지를 이동한다', () => {
    const props = renderManagement({ isFirstPage: true, isLastPage: false, totalPages: 2 });

    fireEvent.click(screen.getByRole('button', { name: '다음' }));
    expect(props.onPageChange).toHaveBeenCalledWith(1);
  });

  it('상세 응답의 오류와 집계를 표시하고 닫을 수 있다', () => {
    const props = renderManagement({
      detailStatus: 'success',
      isDetailOpen: true,
      selectedRun: DETAIL,
    });

    expect(screen.getByRole('dialog', { name: '작업 실행 상세' })).toBeInTheDocument();
    expect(screen.getByText('SOURCE_TIMEOUT')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '상세 패널 닫기' }));
    expect(props.onCloseDetail).toHaveBeenCalledOnce();
  });

  it('상세 조회 오류에서 다시 시도할 수 있다', () => {
    const props = renderManagement({ detailStatus: 'error', isDetailOpen: true });

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(props.onRetryDetail).toHaveBeenCalledOnce();
  });

  it.each([
    ['loading', '수집 실행 이력을 불러오는 중'],
    ['error', '수집 이력을 불러올 수 없습니다.'],
    ['empty', '수집 실행 이력이 없습니다.'],
  ] as const)('%s 목록 상태를 표시한다', (listStatus, accessibleName) => {
    renderManagement({ listStatus, runs: [] });

    if (listStatus === 'loading') {
      expect(screen.getByRole('status', { name: accessibleName })).toBeInTheDocument();
      return;
    }

    expect(screen.getByText(accessibleName)).toBeInTheDocument();
  });

  it('목록 조회 오류에서 다시 시도할 수 있다', () => {
    const props = renderManagement({ listStatus: 'error', runs: [] });

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(props.onRetryList).toHaveBeenCalledOnce();
  });
});
