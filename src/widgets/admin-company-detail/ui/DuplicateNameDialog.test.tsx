import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { DuplicateNameDialog } from './DuplicateNameDialog';

describe('DuplicateNameDialog', () => {
  it('입력한 기업명과 기존 기업 정보를 비교해 표시하고, 버튼 클릭 시 각 콜백이 호출된다', () => {
    const onEditInput = vi.fn();
    const onConfirmExisting = vi.fn();

    render(
      <DuplicateNameDialog
        attemptedName="플로우테크"
        existingCompany={{
          name: '플로우테크',
          type: 'GENERAL',
          infoSource: 'direct',
          mouStatus: 'ACTIVE',
          registeredAt: '2025.02.12',
          statusLabel: '활성',
        }}
        onEditInput={onEditInput}
        onConfirmExisting={onConfirmExisting}
      />,
    );

    expect(screen.getByText('동일한 이름의 기업이 있습니다.')).toBeInTheDocument();
    expect(
      screen.getByText('기업명 ‘플로우테크’와 동일한 기업이 이미 등록되어 있습니다.'),
    ).toBeInTheDocument();
    expect(screen.getByText('일반기업')).toBeInTheDocument();
    expect(screen.getByText('활성')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '입력 내용 수정' }));
    expect(onEditInput).toHaveBeenCalledOnce();

    fireEvent.click(screen.getByRole('button', { name: '기존 기업 확인' }));
    expect(onConfirmExisting).toHaveBeenCalledOnce();
  });
});
