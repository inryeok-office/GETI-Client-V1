import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { InquiryTypeSelect, type InquiryTypeOption } from './InquiryTypeSelect';

const OPTIONS: readonly InquiryTypeOption[] = [
  { label: 'Error', value: 'ERROR' },
  { label: 'Inconvenience', value: 'INCONVENIENCE' },
  { label: 'Feature request', value: 'FEATURE_REQUEST' },
  { label: 'Etc', value: 'ETC' },
];

function renderSelect(onChange = vi.fn()) {
  render(
    <>
      <label htmlFor="inquiry-type">Inquiry type</label>
      <InquiryTypeSelect id="inquiry-type" value="" options={OPTIONS} onChange={onChange} />
    </>,
  );
  return { combobox: screen.getByRole('combobox', { name: 'Inquiry type' }), onChange };
}

describe('InquiryTypeSelect', () => {
  it('selects the active option with arrow keys and Enter', () => {
    const { combobox, onChange } = renderSelect();

    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    expect(combobox).toHaveAttribute('aria-activedescendant', 'inquiry-type-listbox-option-0');

    fireEvent.keyDown(combobox, { key: 'ArrowDown' });
    expect(combobox).toHaveAttribute('aria-activedescendant', 'inquiry-type-listbox-option-1');
    fireEvent.keyDown(combobox, { key: 'Enter' });

    expect(onChange).toHaveBeenCalledWith('INCONVENIENCE');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('moves to the first and last options with Home and End', () => {
    const { combobox } = renderSelect();
    fireEvent.click(combobox);

    fireEvent.keyDown(combobox, { key: 'End' });
    expect(combobox).toHaveAttribute('aria-activedescendant', 'inquiry-type-listbox-option-3');

    fireEvent.keyDown(combobox, { key: 'Home' });
    expect(combobox).toHaveAttribute('aria-activedescendant', 'inquiry-type-listbox-option-0');
  });

  it('closes the listbox with Escape and keeps combobox focus', () => {
    const { combobox } = renderSelect();
    combobox.focus();
    fireEvent.click(combobox);
    fireEvent.keyDown(combobox, { key: 'Escape' });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(combobox).toHaveFocus();
  });

  it('closes the listbox when Tab leaves the combobox', () => {
    const { combobox } = renderSelect();
    fireEvent.click(combobox);

    fireEvent.keyDown(combobox, { key: 'Tab' });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
  });

  it('closes the listbox when focus moves outside the component', () => {
    render(
      <>
        <label htmlFor="inquiry-type">Inquiry type</label>
        <InquiryTypeSelect id="inquiry-type" value="" options={OPTIONS} onChange={vi.fn()} />
        <input aria-label="Title" />
      </>,
    );
    const combobox = screen.getByRole('combobox', { name: 'Inquiry type' });
    const titleInput = screen.getByLabelText('Title');
    fireEvent.click(combobox);

    fireEvent.blur(combobox, { relatedTarget: titleInput });

    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(combobox).toHaveAttribute('aria-expanded', 'false');
  });
});
