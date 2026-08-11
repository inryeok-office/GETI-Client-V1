import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import type { AdminInquiryListItem } from '@/entities/inquiry';

import { AdminInquiryManagement } from './AdminInquiryManagement';

const INQUIRIES: AdminInquiryListItem[] = [
  {
    inquiryId: '1',
    inquiryTypeLabel: '서비스 이용',
    title: 'AI 추천 결과가 보이지 않습니다.',
    content: '맞춤 추천 공고가 표시되지 않습니다.',
    status: 'RECEIVED',
    author: {
      studentNumber: '1319',
      name: '김민재',
      cohort: 10,
      department: '스마트IoT과',
    },
    createdAt: '2026-08-01T10:24:00',
    answeredAt: null,
    answer: null,
  },
];

describe('AdminInquiryManagement', () => {
  it('검색 결과와 상세 패널을 표시하고 답변을 완료한다', async () => {
    const user = userEvent.setup();
    render(<AdminInquiryManagement initialStatus="success" inquiries={INQUIRIES} />);

    expect(screen.getByText('총 1개 문의')).toBeInTheDocument();

    await user.type(screen.getByRole('searchbox', { name: '문의 검색' }), '없는 문의');
    expect(screen.getByText('조건에 맞는 문의가 없습니다.')).toBeInTheDocument();

    await user.clear(screen.getByRole('searchbox', { name: '문의 검색' }));
    await user.click(screen.getByRole('button', { name: '상세보기' }));

    expect(screen.getByRole('dialog', { name: '문의 상세' })).toBeInTheDocument();
    await user.type(screen.getByRole('textbox', { name: '답변' }), '확인 후 수정했습니다.');
    await user.click(screen.getByRole('button', { name: '답변 완료' }));

    expect(screen.queryByRole('dialog', { name: '문의 상세' })).not.toBeInTheDocument();
    expect(within(screen.getByRole('table')).getByText('답변 완료')).toBeInTheDocument();
  });

  it('상세 패널에서 피그마 형태의 문의 상태 메뉴를 연다', async () => {
    const user = userEvent.setup();
    render(<AdminInquiryManagement initialStatus="success" inquiries={INQUIRIES} />);

    await user.click(screen.getByRole('button', { name: '상세보기' }));

    const dialog = screen.getByRole('dialog', { name: '문의 상세' });
    expect(within(dialog).getByText('2026.08.01 10:24')).toBeInTheDocument();
    await user.click(within(dialog).getByRole('combobox', { name: '문의 상태' }));

    const listbox = within(dialog).getByRole('listbox', { name: '문의 상태' });
    expect(within(listbox).getAllByRole('option')).toHaveLength(3);
    expect(within(listbox).getByRole('option', { name: '처리 중' })).toBeInTheDocument();
    expect(within(listbox).getByRole('option', { name: '답변 대기' })).toBeInTheDocument();
    expect(within(listbox).getByRole('option', { name: '답변 완료' })).toBeInTheDocument();

    await user.click(within(listbox).getByRole('option', { name: '처리 중' }));

    expect(within(screen.getByRole('table')).getByText('처리 중')).toBeInTheDocument();
  });

  it('피그마 형태의 문의 유형 필터를 열고 목록을 필터링한다', async () => {
    const user = userEvent.setup();
    render(<AdminInquiryManagement initialStatus="success" inquiries={INQUIRIES} />);

    await user.click(screen.getByRole('combobox', { name: '문의 유형' }));

    const listbox = screen.getByRole('listbox', { name: '문의 유형' });
    expect(within(listbox).getAllByRole('option')).toHaveLength(5);
    expect(within(listbox).getByRole('option', { name: '전체' })).toHaveAttribute(
      'aria-selected',
      'true',
    );

    await user.click(within(listbox).getByRole('option', { name: '계정·프로필' }));

    expect(screen.getByText('조건에 맞는 문의가 없습니다.')).toBeInTheDocument();
  });

  it('오류 상태에서 다시 시도하면 문의 목록을 표시한다', async () => {
    const user = userEvent.setup();
    render(<AdminInquiryManagement initialStatus="error" inquiries={INQUIRIES} />);

    expect(screen.getByRole('alert')).toHaveTextContent('문의를 불러올 수 없습니다.');
    await user.click(screen.getByRole('button', { name: '다시 시도' }));

    expect(screen.getByText('총 1개 문의')).toBeInTheDocument();
  });

  it('빈 상태를 표시한다', () => {
    render(<AdminInquiryManagement initialStatus="empty" inquiries={[]} />);

    expect(screen.getByText('등록된 문의가 없습니다.')).toBeInTheDocument();
  });
});
