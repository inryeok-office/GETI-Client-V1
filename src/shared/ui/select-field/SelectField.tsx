import { useId, type SelectHTMLAttributes } from 'react';

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  errorMessage?: string;
  label?: string;
}

export function SelectField({
  children,
  className = '',
  disabled,
  errorMessage,
  id,
  label,
  ...props
}: SelectFieldProps) {
  const generatedId = useId();
  const selectId = id ?? generatedId;
  const errorId = errorMessage ? `${selectId}-error` : undefined;

  return (
    <div className="space-y-1.5">
      {label ? (
        <label htmlFor={selectId} className="text-label block text-neutral-700">
          {label}
        </label>
      ) : null}
      <select
        {...props}
        id={selectId}
        disabled={disabled}
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={errorId}
        className={`text-body focus:border-primary-300 h-12 w-full rounded-lg border bg-white px-3 text-neutral-900 outline-none disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 ${errorMessage ? 'border-status-error focus:border-status-error' : 'border-neutral-200'} ${className}`}
      >
        {children}
      </select>
      {errorMessage ? (
        <p id={errorId} className="text-caption text-status-error">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
