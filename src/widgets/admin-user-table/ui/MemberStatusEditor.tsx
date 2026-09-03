import { useState } from 'react';

import {
  ADMIN_MEMBER_STATUS_LABELS,
  type AdminMemberDetail,
  type AdminMemberStatus,
} from '@/entities/member';
import { Button } from '@/shared/ui/button';
import { Dialog } from '@/shared/ui/dialog';

interface MemberStatusEditorProps {
  /** 본인 계정이면 잠근다(서버 403 자기보호의 클라 대응). */
  isSelf: boolean;
  isSaving: boolean;
  member: AdminMemberDetail;
  onUpdate: (status: AdminMemberStatus) => void;
}

/**
 * 계정 상태 표시 + 정지·해제 버튼. 관리자 수동 전이는 `ACTIVE ↔ SUSPENDED`만 가능하고,
 * `PENDING`·`REJECTED`·`WITHDRAWN`은 가입 승인·탈퇴 흐름 담당이라 여기선 안내만 한다.
 */
export function MemberStatusEditor({
  isSelf,
  isSaving,
  member,
  onUpdate,
}: MemberStatusEditorProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const nextStatus: AdminMemberStatus | null =
    member.status === 'ACTIVE' ? 'SUSPENDED' : member.status === 'SUSPENDED' ? 'ACTIVE' : null;
  const isSuspending = nextStatus === 'SUSPENDED';

  return (
    <section>
      <h3 className="text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-500">
        계정 상태
      </h3>
      <div className="mt-3 flex items-center justify-between rounded-lg border border-neutral-200 px-4 py-3">
        <span className="text-sm text-neutral-900">
          {ADMIN_MEMBER_STATUS_LABELS[member.status]}
        </span>
        {nextStatus ? (
          <Button
            variant={isSuspending ? 'dangerOutline' : 'primary'}
            isLoading={isSaving}
            disabled={isSelf}
            onClick={() => setIsConfirmOpen(true)}
          >
            {isSuspending ? '계정 정지' : '정지 해제'}
          </Button>
        ) : (
          <span className="text-xs text-neutral-500">가입 승인·탈퇴 흐름에서 관리됩니다.</span>
        )}
      </div>

      <Dialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={isSuspending ? '계정을 정지할까요?' : '정지를 해제할까요?'}
        panelClassName="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-lg"
        actions={
          <>
            <Button variant="neutral" onClick={() => setIsConfirmOpen(false)}>
              취소
            </Button>
            <Button
              variant={isSuspending ? 'dangerOutline' : 'primary'}
              onClick={() => {
                setIsConfirmOpen(false);
                if (nextStatus) onUpdate(nextStatus);
              }}
            >
              {isSuspending ? '정지' : '해제'}
            </Button>
          </>
        }
      >
        <p className="text-sm leading-[1.6] text-neutral-700">
          {isSuspending
            ? `${member.name ?? member.email} 님은 정지되면 로그인할 수 없습니다.`
            : `${member.name ?? member.email} 님의 로그인을 다시 허용합니다.`}
        </p>
      </Dialog>
    </section>
  );
}
