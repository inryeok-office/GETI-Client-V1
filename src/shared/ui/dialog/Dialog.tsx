'use client';

import { useEffect, type ReactNode } from 'react';

interface DialogProps {
  actions?: ReactNode;
  children: ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
}

export function Dialog({ actions, children, isOpen, onClose, title }: DialogProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-900/40 p-4"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <h2
          id="dialog-title"
          className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900"
        >
          {title}
        </h2>
        <div className="mt-3 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600">
          {children}
        </div>
        {actions ? <div className="mt-6 flex justify-end gap-2">{actions}</div> : null}
      </section>
    </div>
  );
}
