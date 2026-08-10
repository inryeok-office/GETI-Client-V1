'use client';

import { useEffect, useId, useRef, useState } from 'react';

import { Icon } from '@/shared/ui/icon';

interface InquiryTypeSelectProps {
  disabled?: boolean;
  errorMessage?: string;
  id?: string;
  onChange: (value: string) => void;
  options: string[];
  value: string;
}

export function InquiryTypeSelect({
  disabled,
  errorMessage,
  id,
  onChange,
  options,
  value,
}: InquiryTypeSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = errorMessage ? `${selectId}-error` : undefined;
  const listboxId = `${selectId}-listbox`;

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        id={selectId}
        type="button"
        role="combobox"
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={errorId}
        onClick={() => setIsOpen((current) => !current)}
        className={`flex h-[56px] w-full items-center justify-between rounded-[8px] border bg-white pr-[12px] pl-[16px] text-left text-[14px] leading-[1.4] font-medium tracking-[-0.14px] transition-colors outline-none focus:border-[#8cc8da] disabled:cursor-not-allowed disabled:bg-neutral-100 ${
          errorMessage ? 'border-[#ef4444]' : 'border-[#e5e5e5]'
        }`}
      >
        <span className={value ? 'text-[#111]' : 'text-[#525252]'}>
          {value || '문의 유형을 선택해 주세요.'}
        </span>
        <span className="flex size-[20px] shrink-0 items-center justify-center">
          <Icon
            name="chevronDown"
            className={`size-[12px] text-[#525252] transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {isOpen ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={selectId}
          className="absolute top-[64px] z-10 w-full overflow-hidden rounded-[8px] border border-[#e5e5e5] bg-white py-[8px] shadow-[0px_12px_28px_-8px_rgba(23,37,45,0.2)]"
        >
          {options.map((option) => (
            <li key={option} role="none">
              <button
                role="option"
                aria-selected={value === option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                }}
                className={`flex h-[44px] w-full items-center px-[16px] text-left text-[14px] leading-[1.4] tracking-[-0.14px] transition-colors hover:bg-[#f6fbfc] focus:bg-[#f6fbfc] focus:outline-none ${
                  value === option ? 'bg-[#eaf6f9] font-medium text-[#17627a]' : 'text-[#111]'
                }`}
              >
                {option}
              </button>
            </li>
          ))}
        </ul>
      ) : null}

      {errorMessage ? (
        <p id={errorId} className="mt-[6px] text-[12px] leading-[1.5] text-[#ef4444]">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
