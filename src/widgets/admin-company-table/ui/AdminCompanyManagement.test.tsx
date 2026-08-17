import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { AdminCompanyListItem } from '@/entities/company';

import { AdminCompanyManagement } from './AdminCompanyManagement';

const COMPANIES: AdminCompanyListItem[] = [
  {
    id: 'company-1',
    name: '플로우테크',
    type: 'small',
    infoSource: 'direct',
    mouStatus: 'signed',
    mouPeriod: '2025.03.01 – 2027.02.28',
    statusLabel: '정상',
    detailHref: '/admin/companies/company-1',
    activeJobCount: 0,
    activeMouJobCount: 0,
    applicationCount: 0,
  },
  {
    id: 'company-2',
    name: '네오스튜디오',
    type: 'startup',
    infoSource: 'direct',
    mouStatus: 'unsigned',
    mouPeriod: null,
    statusLabel: '정상',
    detailHref: '/admin/companies/company-2',
    activeJobCount: 2,
    activeMouJobCount: 1,
    applicationCount: 18,
  },
];

describe('AdminCompanyManagement', () => {
  it('기업 목록과 검색·필터 UI를 표시한다', () => {
    render(<AdminCompanyManagement companies={COMPANIES} initialVariant="success" />);

    expect(screen.getByRole('heading', { name: '기업 관리' })).toBeInTheDocument();
    expect(screen.getByText('총 2개 기업')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('기업명으로 검색해 보세요.'),
    ).toBeInTheDocument();
    expect(screen.getByText('플로우테크')).toBeInTheDocument();
    expect(screen.getByText('네오스튜디오')).toBeInTheDocument();
  });

  it('기업명으로 검색하면 일치하는 기업만 표시한다', () => {
    render(<AdminCompanyManagement companies={COMPANIES} initialVariant="success" />);

    fireEvent.change(screen.getByPlaceholderText('기업명으로 검색해 보세요.'), {
      target: { value: '네오' },
    });

    expect(screen.getByText('네오스튜디오')).toBeInTheDocument();
    expect(screen.queryByText('플로우테크')).not.toBeInTheDocument();
  });

  it('공개 중인 공고가 없으면 삭제 확인 후 목록에서 제거하고 완료 모달을 보여준다', () => {
    render(<AdminCompanyManagement companies={COMPANIES} initialVariant="success" />);

    fireEvent.click(screen.getAllByRole('button', { name: '삭제' })[0]);
    const dialog = screen.getByRole('dialog', { name: '기업 삭제' });
    expect(within(dialog).getByText("'플로우테크' 기업을 삭제하시겠습니까?")).toBeInTheDocument();
    expect(within(dialog).getByText('공개 중인 공고')).toBeInTheDocument();
    expect(within(dialog).queryByText('삭제할 수 없습니다.')).not.toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: '기업 삭제' }));

    expect(screen.queryByText('플로우테크')).not.toBeInTheDocument();
    expect(screen.getByText('기업 삭제가 완료되었습니다.')).toBeInTheDocument();
  });

  it('공개 중인 공고가 있으면 삭제를 막고 사유를 안내한다', () => {
    render(<AdminCompanyManagement companies={COMPANIES} initialVariant="success" />);

    fireEvent.click(screen.getAllByRole('button', { name: '삭제' })[1]);
    const dialog = screen.getByRole('dialog', { name: '기업 삭제' });

    expect(within(dialog).getByText('삭제할 수 없습니다.')).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: '기업 삭제' })).toBeDisabled();

    fireEvent.click(within(dialog).getByRole('button', { name: '기업 삭제' }));
    expect(screen.getByText('네오스튜디오')).toBeInTheDocument();
    expect(screen.queryByText('기업 삭제가 완료되었습니다.')).not.toBeInTheDocument();
  });

  it('deleting 상태에서 삭제 중 안내를 표시한다', () => {
    render(<AdminCompanyManagement companies={COMPANIES} initialVariant="deleting" />);

    expect(screen.getByText('기업을 삭제하고 있습니다.')).toBeInTheDocument();
  });

  it('delete-forbidden 상태에서 권한 없음 안내를 표시한다', () => {
    render(<AdminCompanyManagement companies={COMPANIES} initialVariant="delete-forbidden" />);

    expect(screen.getByText('기업을 삭제할 권한이 없습니다.')).toBeInTheDocument();
  });

  it('delete-error 상태에서 삭제 실패 모달을 표시한다', () => {
    render(<AdminCompanyManagement companies={COMPANIES} initialVariant="delete-error" />);

    expect(screen.getByText('기업을 삭제하지 못했습니다.')).toBeInTheDocument();
  });

  it('기업 등록 버튼을 누르면 등록 패널이 열린다', () => {
    render(<AdminCompanyManagement companies={COMPANIES} initialVariant="success" />);

    fireEvent.click(screen.getByRole('button', { name: '기업 등록' }));

    expect(screen.getByRole('dialog', { name: '기업 등록' })).toBeInTheDocument();
  });

  it('필수 항목을 입력하고 등록을 확정하면 목록에 추가되고 완료 모달을 보여준다', () => {
    render(<AdminCompanyManagement companies={COMPANIES} initialVariant="success" />);

    fireEvent.click(screen.getByRole('button', { name: '기업 등록' }));
    const panel = screen.getByRole('dialog', { name: '기업 등록' });

    fireEvent.change(screen.getByPlaceholderText('기업명을 입력해 주세요.'), {
      target: { value: '테스트기업' },
    });
    fireEvent.change(within(panel).getByDisplayValue('기업 유형을 선택해 주세요.'), {
      target: { value: 'large' },
    });
    fireEvent.change(screen.getByLabelText('MOU 시작일'), {
      target: { value: '2026-01-01' },
    });
    fireEvent.change(screen.getByLabelText('MOU 종료일'), {
      target: { value: '2027-01-01' },
    });

    const submitButton = within(panel).getByRole('button', { name: '등록하기' });
    expect(submitButton).toBeEnabled();
    fireEvent.click(submitButton);

    const confirmDialog = screen.getByRole('dialog', { name: '기업을 등록할까요?' });
    expect(within(confirmDialog).getByText('테스트기업')).toBeInTheDocument();
    fireEvent.click(within(confirmDialog).getByRole('button', { name: '등록하기' }));

    expect(screen.queryByRole('dialog', { name: '기업 등록' })).not.toBeInTheDocument();
    expect(screen.getByText('기업 등록이 완료되었습니다.')).toBeInTheDocument();
    expect(screen.getByText('테스트기업')).toBeInTheDocument();
  });

  it('기업 수정 버튼을 누르면 기존 값이 채워진 패널이 열리고, 확정하면 목록에 반영된다', () => {
    render(<AdminCompanyManagement companies={COMPANIES} initialVariant="success" />);

    fireEvent.click(screen.getAllByRole('button', { name: '수정' })[0]);
    const panel = screen.getByRole('dialog', { name: '기업 수정' });
    expect(screen.getByDisplayValue('플로우테크')).toBeInTheDocument();

    fireEvent.change(screen.getByDisplayValue('플로우테크'), {
      target: { value: '플로우테크(수정)' },
    });

    const submitButton = within(panel).getByRole('button', { name: '수정하기' });
    fireEvent.click(submitButton);

    const confirmDialog = screen.getByRole('dialog', { name: '변경사항을 저장할까요?' });
    expect(within(confirmDialog).getByText('플로우테크(수정)')).toBeInTheDocument();
    fireEvent.click(within(confirmDialog).getByRole('button', { name: '변경사항 저장' }));

    expect(screen.queryByRole('dialog', { name: '기업 수정' })).not.toBeInTheDocument();
    expect(screen.getByText('기업 수정이 완료되었습니다.')).toBeInTheDocument();
    expect(screen.getByText('플로우테크(수정)')).toBeInTheDocument();
  });

  it('registering 상태에서 등록 중 안내를 표시한다', () => {
    render(<AdminCompanyManagement companies={COMPANIES} initialVariant="registering" />);

    expect(screen.getByText('기업을 등록하고 있습니다.')).toBeInTheDocument();
  });

  it('로딩 상태를 표시한다', () => {
    render(<AdminCompanyManagement companies={[]} initialVariant="loading" />);

    expect(screen.getByText('정보를 불러오는 중입니다.')).toBeInTheDocument();
  });

  it('에러 상태에서 다시 시도 버튼을 표시한다', () => {
    render(<AdminCompanyManagement companies={[]} initialVariant="error" />);

    expect(screen.getByText('기업 정보를 불러오지 못했습니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();
  });

  it('등록된 기업이 하나도 없으면 기업 없음 빈 상태를 표시한다', () => {
    render(<AdminCompanyManagement companies={[]} initialVariant="empty" />);

    expect(screen.getByText('등록된 기업이 없습니다.')).toBeInTheDocument();
  });

  it('검색 결과가 없으면 검색 결과 없음 빈 상태를 표시한다', () => {
    render(<AdminCompanyManagement companies={COMPANIES} initialVariant="success" />);

    fireEvent.change(screen.getByPlaceholderText('기업명으로 검색해 보세요.'), {
      target: { value: '존재하지않는기업' },
    });

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });
});
