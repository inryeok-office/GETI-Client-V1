import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProgramApplyAction } from './ProgramApplyAction';

describe('ProgramApplyAction', () => {
  it('신청 확인 후 완료 모달을 보여주고 취소 액션으로 바뀐다', () => {
    render(<ProgramApplyAction programTitle="프론트엔드 실무 특강" status="RECRUITING" />);

    fireEvent.click(screen.getByRole('button', { name: '신청하기' }));
    const dialog = screen.getByRole('dialog', { name: '프로그램을 신청하시겠습니까?' });
    fireEvent.click(screen.getAllByRole('button', { name: '신청하기' })[1]);

    expect(dialog).not.toBeInTheDocument();
    expect(screen.getByText('프로그램 신청이 완료되었습니다.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '확인' }));
    expect(screen.getByRole('button', { name: '신청 취소' })).toBeInTheDocument();
  });

  it('신청 실패 시 실패 모달을 보여주고 신청 상태를 바꾸지 않는다', () => {
    render(<ProgramApplyAction programTitle="프론트엔드 실무 특강" status="RECRUITING" willFail />);

    fireEvent.click(screen.getByRole('button', { name: '신청하기' }));
    fireEvent.click(screen.getAllByRole('button', { name: '신청하기' })[1]);

    expect(screen.getByText('프로그램을 신청하지 못했습니다.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '확인' }));
    expect(screen.getByRole('button', { name: '신청하기' })).toBeInTheDocument();
  });

  it('신청 취소 확인 후 토스트를 띄우고 신청 버튼으로 돌아간다', () => {
    render(<ProgramApplyAction programTitle="프론트엔드 실무 특강" status="APPLIED" />);

    fireEvent.click(screen.getByRole('button', { name: '신청 취소' }));
    expect(screen.getByRole('dialog', { name: '신청을 취소하시겠습니까?' })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('button', { name: '신청 취소' })[1]);

    expect(screen.getByRole('status')).toHaveTextContent('신청이 취소되었습니다.');
    expect(screen.getByRole('button', { name: '신청하기' })).toBeInTheDocument();
  });

  it('모집 마감이면 신청 버튼을 비활성화한다', () => {
    render(<ProgramApplyAction programTitle="백엔드 아키텍처 세미나" status="CLOSED" />);

    expect(screen.getByRole('button', { name: '모집 마감' })).toBeDisabled();
    expect(screen.getByText('신청 기간이 종료된 프로그램입니다.')).toBeInTheDocument();
  });
});
