import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { AuditLogEntry } from '@/entities/audit-log';

import { AdminAuditLogManagement } from './AdminAuditLogManagement';

const LOGS: AuditLogEntry[] = [
  {
    actionType: 'UPDATE',
    actor: { email: 'admin@geti.kr', name: '개발자' },
    auditLogId: 'audit-1',
    changes: [{ after: '공개', before: '비공개', field: '공개 상태' }],
    detailSummary: '공고 공개 상태 변경',
    occurredAt: '2026.08.01 14:32:18',
    requestPath: '/admin/jobs/JOB-2026-081',
    result: 'SUCCESS',
    resultMessage: '정상 처리',
    summary: '공개 상태 변경',
    targetId: 'JOB-2026-081',
    targetType: '공고',
  },
];

describe('AdminAuditLogManagement', () => {
  it('감사 로그 검색 조건과 작업 실행 이력을 표시한다', () => {
    render(<AdminAuditLogManagement initialStatus="success" logs={LOGS} />);

    expect(screen.getByRole('heading', { name: '감사 로그', level: 1 })).toBeInTheDocument();
    expect(screen.getByRole('region', { name: '감사 로그 작업 실행 이력' })).toBeInTheDocument();
    expect(screen.getByText('공개 상태 변경')).toBeInTheDocument();
  });

  it('작업 유형 필터를 선택하면 선택값을 표시한다', () => {
    render(<AdminAuditLogManagement initialStatus="success" logs={LOGS} />);

    fireEvent.click(screen.getByRole('combobox', { name: '작업 유형' }));
    fireEvent.click(screen.getByRole('option', { name: 'UPDATE' }));

    expect(screen.getByRole('combobox', { name: '작업 유형' })).toHaveTextContent('UPDATE');
  });

  it('선택한 기간으로 감사 로그를 필터링한다', () => {
    render(<AdminAuditLogManagement initialStatus="success" logs={LOGS} />);

    const startDate = screen.getByLabelText('기간 시작');
    const endDate = screen.getByLabelText('기간 종료');

    expect(startDate).toHaveAttribute('placeholder', 'YYYY.MM.DD');
    expect(endDate).toHaveAttribute('inputmode', 'numeric');

    fireEvent.change(endDate, { target: { value: '2026.07.31' } });
    expect(screen.getByText('감사 로그가 없습니다.')).toBeInTheDocument();
  });

  it('기간을 입력하지 않으면 전체 감사 로그를 표시한다', () => {
    render(<AdminAuditLogManagement initialStatus="success" logs={LOGS} />);

    expect(screen.getByLabelText('기간 시작')).toHaveValue('');
    expect(screen.getByLabelText('기간 종료')).toHaveValue('');
    expect(screen.getByText('공개 상태 변경')).toBeInTheDocument();
  });

  it('기간 숫자를 입력하면 YYYY.MM.DD 형식으로 자동 변환한다', () => {
    render(<AdminAuditLogManagement initialStatus="success" logs={LOGS} />);

    fireEvent.change(screen.getByLabelText('기간 시작'), {
      target: { value: '20260801' },
    });

    expect(screen.getByLabelText('기간 시작')).toHaveValue('2026.08.01');
  });

  it('종료일이 시작일보다 빠르면 검증 메시지를 표시한다', () => {
    render(<AdminAuditLogManagement initialStatus="success" logs={LOGS} />);

    fireEvent.change(screen.getByLabelText('기간 시작'), {
      target: { value: '2026.07.01' },
    });
    fireEvent.change(screen.getByLabelText('기간 종료'), {
      target: { value: '2026.06.30' },
    });

    expect(screen.getByText('종료일은 시작일보다 빠를 수 없습니다.')).toBeInTheDocument();
  });

  it('존재하지 않는 날짜를 입력하면 검증 메시지를 표시한다', () => {
    render(<AdminAuditLogManagement initialStatus="success" logs={LOGS} />);

    fireEvent.change(screen.getByLabelText('기간 시작'), {
      target: { value: '20260230' },
    });

    expect(screen.getByText('YYYY.MM.DD 형식으로 입력해 주세요.')).toBeInTheDocument();
  });

  it('상세 보기를 누르면 상세 패널을 표시하고 닫을 수 있다', () => {
    render(<AdminAuditLogManagement initialStatus="success" logs={LOGS} />);

    fireEvent.click(screen.getByRole('button', { name: '상세 보기' }));
    expect(screen.getByRole('dialog', { name: '감사 로그 상세' })).toBeInTheDocument();
    expect(screen.getByText(/admin@geti\.kr/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '상세 패널 닫기' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it.each([
    ['loading', '감사 로그를 불러오는 중'],
    ['error', '감사 로그를 불러올 수 없습니다.'],
    ['empty', '감사 로그가 없습니다.'],
  ] as const)('%s 상태를 표시한다', (initialStatus, accessibleName) => {
    render(<AdminAuditLogManagement initialStatus={initialStatus} logs={[]} />);

    if (initialStatus === 'loading') {
      expect(screen.getByRole('status', { name: accessibleName })).toBeInTheDocument();
      return;
    }

    expect(screen.getByText(accessibleName)).toBeInTheDocument();
  });

  it('오류 상태에서 다시 시도하면 감사 로그 목록을 표시한다', () => {
    render(<AdminAuditLogManagement initialStatus="error" logs={LOGS} />);

    fireEvent.click(screen.getByRole('button', { name: '다시 시도' }));
    expect(screen.getByRole('region', { name: '감사 로그 작업 실행 이력' })).toBeInTheDocument();
  });
});
