'use client';

import Image from 'next/image';
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FocusEvent as ReactFocusEvent,
  type KeyboardEvent as ReactKeyboardEvent,
} from 'react';

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
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = errorMessage ? `${selectId}-error` : undefined;
  const listboxId = `${selectId}-listbox`;
  const selectedOption = options.find((option) => option.value === value);

  const openListbox = () => {
    const selectedIndex = options.findIndex((option) => option.value === value);
    setActiveIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen(true);
  };

  const selectOption = (index: number) => {
    const option = options[index];
    if (!option) return;

    onChange(option.value);
    setIsOpen(false);
  };

  const handleKeyDown = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!isOpen) {
        openListbox();
        return;
      }

      const offset = event.key === 'ArrowDown' ? 1 : -1;
      setActiveIndex((current) => Math.min(Math.max(current + offset, 0), options.length - 1));
      return;
    }

    if (!isOpen) return;

    if (event.key === 'Tab') {
      setIsOpen(false);
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      setActiveIndex(event.key === 'Home' ? 0 : options.length - 1);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectOption(activeIndex);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      event.nativeEvent.stopImmediatePropagation();
      setIsOpen(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isOpen]);

  const handleBlur = (event: ReactFocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative" onBlur={handleBlur}>
      <button
        id={selectId}
        type="button"
        role="combobox"
        disabled={disabled}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-activedescendant={isOpen ? `${listboxId}-option-${activeIndex}` : undefined}
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={errorId}
        onClick={() => {
          if (isOpen) setIsOpen(false);
          else openListbox();
        }}
        onKeyDown={handleKeyDown}
        className={`flex h-[56px] w-full items-center justify-between rounded-[8px] border bg-white pr-[8px] pl-[16px] text-left text-[14px] leading-[1.4] font-medium transition-colors outline-none focus:border-[#8cc8da] disabled:cursor-not-allowed disabled:bg-neutral-100 ${
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
          {options.map((option, index) => {
            const isSelected = value === option.value;

            return (
              <li key={option.value} role="none">
                <button
                  id={`${listboxId}-option-${index}`}
                  type="button"
                  role="option"
                  tabIndex={-1}
                  aria-selected={isSelected}
                  onClick={() => selectOption(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  className={`flex h-[44px] w-full cursor-pointer items-center justify-between rounded-[8px] px-[16px] text-left text-[14px] leading-[21px] transition-colors ${
                    isSelected || activeIndex === index
                      ? 'bg-[#f6fbfc] text-[#17627a]'
                      : 'bg-white text-[#111]'
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
