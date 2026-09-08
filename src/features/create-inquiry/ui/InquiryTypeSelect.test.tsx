import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { InquiryTypeSelect, type InquiryTypeOption } from './InquiryTypeSelect';

const OPTIONS: readonly InquiryTypeOption[] = [
  { label: '오류', value: 'ERROR' },
  { label: '불편사항', value: 'INCONVENIENCE' },
  { label: '기능 요청', value: 'FEATURE_REQUEST' },
  { label: '기타', value: 'ETC' },
];

function renderSelect(onChange = vi.fn()) {
  render(
    <>
      <label htmlFor="inquiry-type">문의 유형</label>
      <InquiryTypeSelect id="inquiry-type" value="" options={OPTIONS} onChange={onChange} />
    </>,
  );
  return { combobox: screen.getByRole('combobox', { name: '문의 유형' }), onChange };
}

describe('InquiryTypeSelect', () => {
  it('방향키와 Enter로 활성 옵션을 선택한다', () => {
    const { combobox, onChange } = renderSelect();

    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    expect(combobox).toHaveAttribute('aria-activedescendant', 'inquiry-type-listbox-option-0');

    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    expect(combobox).toHaveAttribute('aria-activedescendant', 'inquiry-type-listbox-option-1');
    fireEvent.keyDown(combobox, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith('INCONVENIENCE');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('Home과 End로 처음과 마지막 옵션을 이동한다', () => {
    const { combobox } = renderSelect();
    fireEvent.click(combobox);

    fireEvent.keyDown(combobox, { key: 'End' });
    expect(combobox).toHaveAttribute('aria-activedescendant', 'inquiry-type-listbox-option-3');

    fireEvent.keyDown(combobox, { key: 'Home' });
    expect(combobox).toHaveAttribute('aria-activedescendant', 'inquiry-type-listbox-option-0');
  });

  it('Escape로 목록을 닫고 combobox 포커스를 유지한다', () => {
    const { combobox } = renderSelect();
    combobox.focus();
    fireEvent.click(combobox);
    fireEvent.keyDown(combobox, { key: 'Escape' });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(combobox).toHaveFocus();
  });
});
