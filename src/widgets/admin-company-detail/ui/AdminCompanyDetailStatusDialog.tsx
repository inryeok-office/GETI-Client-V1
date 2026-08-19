import type { ReactNode } from 'react';

interface AdminCompanyDetailStatusDialogProps {
  actions?: ReactNode;
  description: string;
  icon: ReactNode;
  title: string;
}

/**
 * 어드민 기업 상세 저장 결과 모달의 공용 셸(아이콘 · 제목 · 설명 · 버튼).
 * `admin-company-table`의 `AdminCompanyStatusDialog`와 동일한 폭(520px) · 간격을 쓰지만,
 * widgets 레이어 간 직접 참조가 금지돼 있어 이 위젯 안에 같은 패턴으로 다시 둔다.
 * 간격 · 색상은 Figma(저장 결과 모달 937:7485 · 937:8002 · 938:8626 · 939:9161)의 값을 그대로 옮겼다.
 */
export function AdminCompanyDetailStatusDialog({
  actions,
  description,
  icon,
  title,
}: AdminCompanyDetailStatusDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/[0.24] p-4"
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
