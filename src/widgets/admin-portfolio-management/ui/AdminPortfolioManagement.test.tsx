import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { PortfolioRequest, PortfolioSubmission } from '@/entities/portfolio-request';

import { AdminPortfolioManagement } from './AdminPortfolioManagement';

const REQUESTS: PortfolioRequest[] = [
  {
    requestId: 1,
    title: '상반기 포트폴리오',
    duePeriod: '08.01–08.20',
    target: '10기 전체',
    submittedCount: 1,
    targetCount: 2,
    status: 'OPEN',
    createdAt: '2026.07.25',
  },
];

const SUBMISSIONS: PortfolioSubmission[] = [
  {
    submissionId: 1,
    studentName: '김민재',
    studentNumber: '1319',
    cohortAndDepartment: '10기, 소프트웨어과',
    status: 'SUBMITTED',
    submittedAt: '08.12 14:32',
    materialType: 'URL',
  },
];

describe('AdminPortfolioManagement', () => {
  it('포트폴리오 관리자 탑바를 표시하고 제출 현황에서도 유지한다', () => {
    render(
      <AdminPortfolioManagement
        initialStatus="success"
        requests={REQUESTS}
        submissions={SUBMISSIONS}
      />,
    );

    expect(screen.getByText('포트폴리오 관리')).toBeInTheDocument();
    expect(screen.getByText('개발자 · 외 1개')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '제출 현황' }));

    expect(screen.getByText('포트폴리오 관리')).toBeInTheDocument();
    expect(screen.getByText('개발자 · 외 1개')).toBeInTheDocument();
  });

  it('포트폴리오 요청 목록을 표시하고 제출 현황으로 이동한다', () => {
    render(
      <AdminPortfolioManagement
        initialStatus="success"
        requests={REQUESTS}
        submissions={SUBMISSIONS}
      />,
    );

    expect(screen.getByText('상반기 포트폴리오')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '제출 현황' }));
    expect(screen.getByRole('heading', { name: '포트폴리오 제출 현황' })).toBeInTheDocument();
    expect(screen.getByText('김민재')).toBeInTheDocument();
  });

  it('요청 등록 폼의 필수값 오류를 표시한다', () => {
    render(
      <AdminPortfolioManagement
        initialStatus="success"
        requests={REQUESTS}
        submissions={SUBMISSIONS}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /수합 요청 등록/ }));
    fireEvent.click(screen.getByRole('button', { name: '등록하기' }));

    expect(screen.getByText('요청 제목을 입력해 주세요.')).toBeInTheDocument();
    expect(screen.getByText('설명을 입력해 주세요.')).toBeInTheDocument();
    expect(screen.getByText('대상 기수를 선택해 주세요.')).toBeInTheDocument();
    expect(screen.getByText('제출 기간과 대상 학생을 확인해 주세요.')).toBeInTheDocument();
  });

  it('학생 이름을 입력하고 Enter를 누르면 선택하며 외부 클릭으로 목록을 닫는다', () => {
    render(
      <AdminPortfolioManagement
        initialStatus="success"
        requests={REQUESTS}
        submissions={SUBMISSIONS}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /수합 요청 등록/ }));
    const studentInput = screen.getByPlaceholderText('이름 또는 학번으로 학생을 선택해 주세요.');
    fireEvent.focus(studentInput);
    fireEvent.change(studentInput, { target: { value: '김민재' } });
    fireEvent.keyDown(studentInput, { key: 'Enter' });

    expect(screen.getByRole('button', { name: '김민재 선택 해제' })).toBeInTheDocument();
    expect(screen.getByRole('listbox', { name: '개별 학생 선택' })).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByRole('heading', { name: '수합 요청 등록' }));
    expect(screen.queryByRole('listbox', { name: '개별 학생 선택' })).not.toBeInTheDocument();
  });

  it('필수값을 입력하고 등록하면 새 요청을 목록에 추가한다', () => {
    render(
      <AdminPortfolioManagement
        initialStatus="success"
        requests={REQUESTS}
        submissions={SUBMISSIONS}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /수합 요청 등록/ }));
    fireEvent.change(screen.getByPlaceholderText('제목을 입력해 주세요.'), {
      target: { value: '신규 포트폴리오 요청' },
    });
    fireEvent.change(screen.getByPlaceholderText('학생에게 안내할 내용을 입력해 주세요.'), {
      target: { value: '제출 안내 내용' },
    });
    const dateInputs = screen.getAllByPlaceholderText('YYYY.MM.DD');
    fireEvent.change(dateInputs[0], { target: { value: '2026.08.12' } });
    fireEvent.change(dateInputs[1], { target: { value: '2026.08.31' } });
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('combobox', { name: '대상 기수' }));
    fireEvent.click(screen.getByRole('option', { name: '10기' }));
    fireEvent.click(screen.getByRole('button', { name: '등록하기' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('신규 포트폴리오 요청')).toBeInTheDocument();
  });

  it('종료일이 시작일보다 빠르면 등록을 차단한다', () => {
    render(
      <AdminPortfolioManagement
        initialStatus="success"
        requests={REQUESTS}
        submissions={SUBMISSIONS}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /수합 요청 등록/ }));
    fireEvent.change(screen.getByPlaceholderText('제목을 입력해 주세요.'), {
      target: { value: '날짜 검증 요청' },
    });
    fireEvent.change(screen.getByPlaceholderText('학생에게 안내할 내용을 입력해 주세요.'), {
      target: { value: '제출 안내 내용' },
    });
    const dateInputs = screen.getAllByPlaceholderText('YYYY.MM.DD');
    fireEvent.change(dateInputs[0], { target: { value: '2026.08.31' } });
    fireEvent.change(dateInputs[1], { target: { value: '2026.08.12' } });
    const dialog = screen.getByRole('dialog');
    fireEvent.click(within(dialog).getByRole('combobox', { name: '대상 기수' }));
    fireEvent.click(screen.getByRole('option', { name: '10기' }));
    fireEvent.click(screen.getByRole('button', { name: '등록하기' }));

    expect(screen.getByText('제출 종료일은 시작일보다 빠를 수 없습니다.')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.queryByText('날짜 검증 요청', { selector: 'td' })).not.toBeInTheDocument();
  });

  it('존재하지 않는 날짜와 공백 입력을 거부한다', () => {
    render(
      <AdminPortfolioManagement
        initialStatus="success"
        requests={REQUESTS}
        submissions={SUBMISSIONS}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /수합 요청 등록/ }));
    fireEvent.change(screen.getByPlaceholderText('제목을 입력해 주세요.'), {
      target: { value: '   ' },
    });
    fireEvent.change(screen.getByPlaceholderText('학생에게 안내할 내용을 입력해 주세요.'), {
      target: { value: '   ' },
    });
    const dateInputs = screen.getAllByPlaceholderText('YYYY.MM.DD');
    fireEvent.change(dateInputs[0], { target: { value: '2026.02.30' } });
    fireEvent.change(dateInputs[1], { target: { value: '2026.03.01' } });
    fireEvent.click(screen.getByRole('button', { name: '등록하기' }));

    expect(screen.getByText('요청 제목을 입력해 주세요.')).toBeInTheDocument();
    expect(screen.getByText('설명을 입력해 주세요.')).toBeInTheDocument();
    expect(screen.getByText('올바른 시작일을 입력해 주세요.')).toBeInTheDocument();
  });

  it('삭제 확인 전에는 요청을 유지하고 확인 후 삭제한다', () => {
    render(
      <AdminPortfolioManagement
        initialStatus="success"
        requests={REQUESTS}
        submissions={SUBMISSIONS}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    let deleteDialog = screen.getByRole('dialog', { name: '수합 요청 삭제' });
    expect(
      within(deleteDialog).getByText('상반기 포트폴리오 수합 요청을 삭제하시겠습니까?'),
    ).toBeInTheDocument();
    expect(
      within(deleteDialog).getByText('이미 제출된 자료와 제출 이력이 함께 표시되지 않습니다.'),
    ).toBeInTheDocument();

    fireEvent.click(within(deleteDialog).getByRole('button', { name: '취소' }));
    expect(screen.getByText('상반기 포트폴리오')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    deleteDialog = screen.getByRole('dialog', { name: '수합 요청 삭제' });
    fireEvent.click(within(deleteDialog).getByRole('button', { name: '삭제' }));

    expect(screen.queryByText('상반기 포트폴리오')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: '수합 요청 삭제' })).not.toBeInTheDocument();
  });

  it('제출 현황의 일괄 다운로드 버튼에는 아이콘을 표시하지 않는다', () => {
    render(
      <AdminPortfolioManagement
        initialStatus="success"
        requests={REQUESTS}
        submissions={SUBMISSIONS}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '제출 현황' }));
    const downloadButton = screen.getByRole('button', { name: '자료 일괄 다운로드' });
    expect(downloadButton.querySelector('svg')).toBeNull();
  });

  it('제출 현황 요약을 피그마 목업 값으로 표시한다', () => {
    render(
      <AdminPortfolioManagement
        initialStatus="success"
        requests={REQUESTS}
        submissions={SUBMISSIONS}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '제출 현황' }));

    expect(screen.getByText('2026 상반기 포트폴리오 수합 · 대상 60명')).toBeInTheDocument();
    expect(screen.getByText('42명')).toBeInTheDocument();
    expect(screen.getByText('18명')).toBeInTheDocument();
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('네트워크 오류 상태를 표시한다', () => {
    render(
      <AdminPortfolioManagement
        initialStatus="error"
        requests={REQUESTS}
        submissions={SUBMISSIONS}
      />,
    );

    expect(screen.getByText('포트폴리오 요청을 불러올 수 없습니다.')).toBeInTheDocument();
    expect(screen.getByText('잠시 후 다시 시도해 주세요.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '다시 시도' })).not.toBeInTheDocument();
  });

  it('검색 결과 없음 상태를 표시한다', () => {
    render(<AdminPortfolioManagement initialStatus="empty" requests={[]} submissions={[]} />);

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
    expect(screen.getByText('검색어를 확인하거나 다른 키워드로 검색해보세요.')).toBeInTheDocument();
  });

  it('로딩 상태를 표시한다', () => {
    render(<AdminPortfolioManagement initialStatus="loading" requests={[]} submissions={[]} />);

    expect(screen.getByText('정보를 불러오는 중입니다.')).toBeInTheDocument();
    expect(screen.getByText('잠시만 기다려 주세요.')).toBeInTheDocument();
  });

  it('요청 목록은 피그마 너비를 유지하고 좁은 화면에서 가로 스크롤을 제공한다', () => {
    render(
      <AdminPortfolioManagement
        initialStatus="success"
        requests={REQUESTS}
        submissions={SUBMISSIONS}
      />,
    );

    const listRegion = screen.getByRole('region', { name: '포트폴리오 요청 목록' });
    expect(listRegion).toHaveClass('overflow-x-auto');
    expect(within(listRegion).getByRole('table')).toHaveClass('w-[1620px]', 'min-w-[1620px]');
  });
});
