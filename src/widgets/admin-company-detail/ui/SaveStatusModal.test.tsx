import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SaveStatusModal } from './SaveStatusModal';

describe('SaveStatusModal', () => {
  it('saving 상태에서는 안내 문구만 표시하고 확인 버튼이 없다', () => {
    render(<SaveStatusModal status="saving" onConfirm={vi.fn()} />);

    expect(screen.getByText('변경사항을 저장하고 있습니다.')).toBeInTheDocument();
    expect(screen.getByText('잠시만 기다려 주세요.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '확인' })).not.toBeInTheDocument();
  });

  it('success 상태에서는 완료 문구와 확인 버튼을 표시하고 클릭하면 onConfirm이 호출된다', () => {
    const onConfirm = vi.fn();
    render(<SaveStatusModal status="success" onConfirm={onConfirm} />);

    expect(screen.getByText('변경사항을 저장했습니다.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '확인' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('error 상태에서는 실패 문구를 표시한다', () => {
    render(<SaveStatusModal status="error" onConfirm={vi.fn()} />);

    expect(screen.getByText('변경사항을 저장하지 못했습니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
  });

  it('conflict 상태에서는 충돌 문구를 표시한다', () => {
    render(<SaveStatusModal status="conflict" onConfirm={vi.fn()} />);

    expect(screen.getByText('다른 관리자가 먼저 수정했습니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
  });
});
