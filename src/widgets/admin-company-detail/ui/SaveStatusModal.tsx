import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';

import { AdminCompanyDetailStatusDialog } from './AdminCompanyDetailStatusDialog';

export type SaveStatus = 'conflict' | 'error' | 'saving' | 'success';

interface SaveStatusModalProps {
  status: SaveStatus;
  /** "확인" 클릭 시 실행. `saving` 상태는 버튼이 없어 호출되지 않는다. */
  onConfirm: () => void;
}

const SAVE_STATUS_COPY: Record<SaveStatus, { description: string; title: string }> = {
  saving: {
    title: '변경사항을 저장하고 있습니다.',
    description: '잠시만 기다려 주세요.',
  },
  success: {
    title: '변경사항을 저장했습니다.',
    description: '기업 정보가 최신 상태로 반영되었습니다.',
  },
  error: {
    title: '변경사항을 저장하지 못했습니다.',
    description: '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.',
  },
  conflict: {
    title: '다른 관리자가 먼저 수정했습니다.',
    description:
      '현재 화면의 정보가 최신 정보와 다릅니다.\n최신 정보를 다시 불러온 후 변경 내용을 확인해 주세요.',
  },
};

/**
 * 어드민 기업 상세 저장 결과 모달. `status`에 따라 아이콘 · 색상 · 문구만 갈아 끼운다.
 * 간격 · 색상은 Figma(저장 중 938:8626, 저장 성공 937:7485, 저장 실패 937:8002, 저장 충돌 939:9161)의 값을 그대로 옮겼다.
 */
export function SaveStatusModal({ status, onConfirm }: SaveStatusModalProps) {
  const copy = SAVE_STATUS_COPY[status];

  return (
    <AdminCompanyDetailStatusDialog
      icon={<SaveStatusIcon status={status} />}
      title={copy.title}
      description={copy.description}
      actions={
        status === 'saving' ? undefined : (
          <Button className="w-full" onClick={onConfirm}>
            확인
          </Button>
        )
      }
    />
  );
}

function SaveStatusIcon({ status }: { status: SaveStatus }) {
  switch (status) {
    case 'saving':
      return <Icon name="spinner" className="text-primary-700 size-16 animate-spin" />;
    case 'success':
      return <Icon name="checkCircleFilled" className="text-status-success size-16" />;
    case 'error':
      return <Icon name="alertCircleFilled" className="text-status-error size-16" />;
    case 'conflict':
      return <Icon name="alertTriangleFilled" className="text-status-warning size-16" />;
  }
}
