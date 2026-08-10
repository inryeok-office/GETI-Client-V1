import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Button } from './button';
import { Dialog } from './dialog';
import { PageState } from './page-state';
import { SelectField } from './select-field';
import { TextField } from './text-field';

describe('Button', () => {
  it('로딩 중에는 비활성화하고 상태를 시각적으로 표시한다', () => {
    render(
      <Button isLoading type="submit">
        저장하기
      </Button>,
    );

    const button = screen.getByRole('button', { name: '저장하기' });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('type', 'submit');
  });
});

describe('TextField', () => {
  it('레이블과 오류 메시지를 입력에 연결한다', () => {
    render(<TextField label="이름" errorMessage="이름을 입력해 주세요." />);

    const input = screen.getByLabelText('이름');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText('이름을 입력해 주세요.')).toHaveAttribute(
      'id',
      input.getAttribute('aria-describedby'),
    );
  });
});

describe('SelectField', () => {
  it('비활성 상태를 전달한다', () => {
    render(
      <SelectField label="학과" disabled>
        <option>소프트웨어과</option>
      </SelectField>,
    );

    expect(screen.getByLabelText('학과')).toBeDisabled();
  });
});

describe('Dialog', () => {
  it('Escape 키를 누르면 닫기 콜백을 호출한다', () => {
    const handleClose = vi.fn();
    render(
      <Dialog isOpen title="계정 비활성화" onClose={handleClose}>
        비활성화하면 로그인이 제한됩니다.
      </Dialog>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledOnce();
  });
});

describe('PageState', () => {
  it('로딩 상태를 보조 기술에 알린다', () => {
    render(<PageState variant="loading" title="불러오는 중" description="잠시만 기다려 주세요." />);

    expect(screen.getByText('불러오는 중').parentElement).toHaveAttribute('aria-live', 'polite');
  });
});
