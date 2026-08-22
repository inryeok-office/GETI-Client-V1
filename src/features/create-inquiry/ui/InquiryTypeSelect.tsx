'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';

import type { InquiryType } from '@/entities/inquiry';
import { Icon } from '@/shared/ui/icon';

export interface InquiryTypeOption {
  label: string;
  value: InquiryType;
}

interface InquiryTypeSelectProps {
  disabled?: boolean;
  errorMessage?: string;
  id?: string;
  onChange: (value: InquiryType) => void;
  options: readonly InquiryTypeOption[];
  value: InquiryType | '';
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
  const selectedOption = options.find((option) => option.value === value);

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
        className={`flex h-[56px] w-full items-center justify-between rounded-[8px] border bg-white pr-[8px] pl-[16px] text-left text-[14px] leading-[1.4] font-medium tracking-[-0.14px] transition-colors outline-none focus:border-[#8cc8da] disabled:cursor-not-allowed disabled:bg-neutral-100 ${
          errorMessage ? 'border-[#ef4444]' : 'border-[#e5e5e5]'
        }`}
      >
        <span className={value ? 'text-[#111]' : 'text-[#525252]'}>
          {selectedOption?.label ?? '문의 유형을 선택해 주세요.'}
        </span>
        <span className="flex h-[10px] w-[20px] shrink-0 items-center justify-center overflow-hidden">
          <Image
            src="/icons/inquiry-type-select-chevron.svg"
            alt=""
            width={10}
            height={20}
            className="shrink-0 rotate-90"
          />
        </span>
      </button>

      {isOpen ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={selectId}
          className="absolute top-[64px] z-10 flex w-full flex-col gap-[2px] overflow-hidden rounded-[8px] border border-[#e5e5e5] bg-white p-[8px] shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)]"
        >
          {options.map((option) => {
            const isSelected = value === option.value;

            return (
              <li key={option.value} role="none">
                <button
                  role="option"
                  aria-selected={isSelected}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex h-[44px] w-full items-center justify-between rounded-[8px] px-[16px] text-left text-[14px] leading-[21px] tracking-[-0.14px] transition-colors hover:bg-[#f6fbfc] focus:bg-[#f6fbfc] focus:outline-none ${
                    isSelected ? 'bg-[#f6fbfc] text-[#17627a]' : 'bg-white text-[#111]'
                  }`}
                >
                  {option.label}
                  {isSelected && <Icon name="check" className="size-5 shrink-0" />}
                </button>
              </li>
            );
          })}
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
