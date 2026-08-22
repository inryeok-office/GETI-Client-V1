'use client';

import Image from 'next/image';
import { useEffect, useId, useRef, useState } from 'react';

import { Icon } from '@/shared/ui/icon';

export interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownFieldProps {
  ariaLabel?: string;
  controlClassName?: string;
  className?: string;
  disabled?: boolean;
  errorMessage?: string;
  isLargeText?: boolean;
  label?: string;
  onChange: (value: string) => void;
  options: readonly DropdownOption[];
  placeholder: string;
  value: string;
}

export function DropdownField({
  ariaLabel,
  controlClassName = 'h-14',
  className = '',
  disabled,
  errorMessage,
  isLargeText = false,
  label,
  onChange,
  options,
  placeholder,
  value,
}: DropdownFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const listboxId = `${generatedId}-listbox`;
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
    <div ref={containerRef} className={`relative ${className}`}>
      {label ? (
        <label
          id={`${generatedId}-label`}
          className={`mb-2 block text-neutral-900 ${isLargeText ? 'text-body-lg' : 'text-label'}`}
        >
          {label}
        </label>
      ) : null}
      <button
        id={generatedId}
        type="button"
        role="combobox"
        disabled={disabled}
        aria-label={ariaLabel}
        aria-labelledby={label ? `${generatedId}-label` : undefined}
        aria-controls={listboxId}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-invalid={errorMessage ? true : undefined}
        onClick={() => setIsOpen((current) => !current)}
        className={`focus:border-primary-300 flex w-full items-center justify-between rounded-lg border bg-white text-left transition-colors outline-none disabled:bg-neutral-100 ${controlClassName} ${
          isLargeText ? 'text-body-lg px-4' : 'text-label pr-2 pl-4'
        } ${errorMessage ? 'border-status-error' : 'border-neutral-200'}`}
      >
        <span className={selectedOption ? 'text-neutral-900' : 'text-neutral-600'}>
          {selectedOption?.label ?? placeholder}
        </span>
        <span
          className={`flex shrink-0 items-center justify-center overflow-hidden ${isLargeText ? 'h-3 w-6' : 'h-[10px] w-5'}`}
        >
          <Image
            src="/icons/inquiry-type-select-chevron.svg"
            alt=""
            width={isLargeText ? 12 : 10}
            height={isLargeText ? 24 : 20}
            className={`shrink-0 transition-transform ${isOpen ? '-rotate-90' : 'rotate-90'}`}
          />
        </span>
      </button>

      {isOpen ? (
        <ul
          id={listboxId}
          role="listbox"
          aria-labelledby={generatedId}
          className={`shadow-raised absolute z-20 flex w-full flex-col gap-[2px] overflow-hidden rounded-lg border border-neutral-200 bg-white p-2 ${label ? 'top-[90px]' : 'top-[64px]'}`}
        >
          {options.map((option) => {
            const isSelected = value === option.value;

            return (
              <li key={option.value} role="none">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`hover:bg-primary-50 focus:bg-primary-50 flex h-11 w-full items-center justify-between rounded-lg px-4 text-left transition-colors focus:outline-none ${isLargeText ? 'text-body-lg' : 'text-body'} ${
                    isSelected ? 'bg-primary-50 text-primary-700' : 'bg-white text-neutral-900'
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
        <p className="text-caption text-status-error mt-1.5">{errorMessage}</p>
      ) : null}
    </div>
  );
}
