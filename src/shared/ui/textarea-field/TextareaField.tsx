import { useId, type TextareaHTMLAttributes } from 'react';

interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  errorMessage?: string;
  label?: string;
}

export function TextareaField({
  className = '',
  disabled,
  errorMessage,
  id,
  label,
  ...props
}: TextareaFieldProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = errorMessage ? `${textareaId}-error` : undefined;

  return (
    <div className="space-y-1.5">
      {label ? (
        <label
          htmlFor={textareaId}
          className="block text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-700"
        >
          {label}
        </label>
      ) : null}
      <textarea
        {...props}
        id={textareaId}
        disabled={disabled}
        aria-invalid={errorMessage ? true : undefined}
        aria-describedby={errorId}
        className={`focus:border-primary-300 w-full resize-none rounded-lg border bg-white px-3 py-3 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-900 outline-none placeholder:text-neutral-600 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:bg-neutral-100 ${errorMessage ? 'border-status-error focus:border-status-error' : 'border-neutral-200'} ${className}`}
      />
      {errorMessage ? (
        <p id={errorId} className="text-status-error text-xs leading-[1.5] tracking-[-0.12px]">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
