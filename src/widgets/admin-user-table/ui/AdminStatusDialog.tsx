import type { ReactNode } from 'react';

interface AdminStatusDialogProps {
  actions?: ReactNode;
  description: string;
  icon: ReactNode;
  title: string;
}

export function AdminStatusDialog({ actions, description, icon, title }: AdminStatusDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        className={`flex w-[520px] flex-col items-center overflow-hidden rounded-2xl bg-white px-8 shadow-[0px_16px_40px_-8px_rgba(23,37,45,0.16)] ${actions ? 'py-8' : 'py-10'}`}
      >
        <div className="flex w-full flex-col items-center gap-8">
          {icon}
          <div className="flex w-full flex-col items-center gap-4 text-center">
            <p className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
              {title}
            </p>
            <p className="text-base leading-[1.6] tracking-[-0.16px] whitespace-pre-line text-neutral-600">
              {description}
            </p>
          </div>
          {actions ? (
            <div className="flex w-full items-center justify-center">{actions}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
