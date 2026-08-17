import type { ReactNode } from 'react';

interface AdminCompanyStatusDialogProps {
  actions?: ReactNode;
  description: string;
  icon: ReactNode;
  title: string;
}

/**
 * 어드민 기업 관리 결과 모달(삭제 완료/실패, 등록 완료).
 * 다른 어드민 화면(사용자 관리)의 결과 모달과 같은 폭(520px)·간격(32px/16px)을 쓴다.
 * 지원서 제출 흐름 기준으로 만들어진 공용 `shared/ui/status-dialog`와는 간격이 달라 그대로 재사용할 수 없다.
 * 간격 · 색상은 Figma(기업 관리 - 등록 완료 934:17580)의 값을 그대로 옮겼다.
 */
export function AdminCompanyStatusDialog({
  actions,
  description,
  icon,
  title,
}: AdminCompanyStatusDialogProps) {
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
