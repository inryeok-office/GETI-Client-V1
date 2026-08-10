'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';

interface DialogProps {
  actions?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
  isOpen: boolean;
  onClose: () => void;
  panelClassName?: string;
  title: string;
  titleClassName?: string;
}

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function Dialog({
  actions,
  children,
  contentClassName = 'mt-3 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600',
  isOpen,
  onClose,
  panelClassName = 'w-full max-w-md rounded-xl bg-white p-6 shadow-lg',
  title,
  titleClassName = 'text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900',
}: DialogProps) {
  const dialogRef = useRef<HTMLElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocusedElement = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current;
    const focusableElements = dialog?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR);
    const firstFocusableElement = focusableElements?.[0] ?? dialog;
    firstFocusableElement?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (event.key !== 'Tab' || !dialog) return;

      const elements = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
      if (elements.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const firstElement = elements[0];
      const lastElement = elements[elements.length - 1];

      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      previouslyFocusedElement?.focus();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={panelClassName}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className={titleClassName}>
          {title}
        </h2>
        <div className={contentClassName}>{children}</div>
        {actions ? <div className="mt-6 flex justify-end gap-2">{actions}</div> : null}
      </section>
    </div>
  );
}
