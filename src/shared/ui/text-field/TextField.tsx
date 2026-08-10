import { useId, type InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  errorMessage?: string;
  label?: string;
}

export function TextField({
  className = '',
  disabled,
  errorMessage,
  id,
  label,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = errorMessage ? `${inputId}-error` : undefined;

  return (
    <div className="space-y-1.5">
      {label ? (
        <label
          htmlFor={inputId}
          className="block text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-700"
        >
          {label}
        </label>
      ) : null}
      <input
        {...props}
        id={inputId}
        disabled={disabled}
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={errorId}
        className={`focus:border-primary-300 h-12 w-full rounded-lg border bg-white px-3 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-900 outline-none placeholder:text-neutral-600 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 ${errorMessage ? 'border-status-error focus:border-status-error' : 'border-neutral-200'} ${className}`}
      />
      {errorMessage ? (
        <p id={errorId} className="text-status-error text-xs leading-[1.5] tracking-[-0.12px]">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
