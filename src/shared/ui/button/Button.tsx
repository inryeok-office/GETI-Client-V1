import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { Icon } from '@/shared/ui/icon';

type ButtonVariant = 'neutral' | 'outline' | 'primary';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading?: boolean;
  variant?: ButtonVariant;
}

const VARIANT_CLASS_NAMES: Record<ButtonVariant, string> = {
  neutral:
    'border border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50 active:bg-neutral-100 disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400',
  primary:
    'bg-primary-700 text-white hover:bg-primary-400 active:bg-primary-700 disabled:bg-neutral-100 disabled:text-neutral-400',
  outline:
    'border border-primary-300 bg-white text-primary-700 hover:bg-primary-100 active:bg-accent-100 disabled:border-neutral-200 disabled:bg-neutral-100 disabled:text-neutral-400',
};

export function Button({
  children,
  className = '',
  disabled,
  isLoading = false,
  type = 'button',
  variant = 'primary',
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      type={type}
      disabled={disabled || isLoading}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg px-6 text-sm leading-[1.4] font-medium tracking-[-0.14px] transition-colors disabled:cursor-not-allowed ${VARIANT_CLASS_NAMES[variant]} ${className}`}
    >
      {isLoading ? <Icon name="spinner" className="size-4 animate-spin" /> : null}
      <span>{children}</span>
    </button>
  );
}
