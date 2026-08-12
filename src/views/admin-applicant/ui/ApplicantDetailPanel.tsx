import { APPLICANT_STATUS_LABEL, type Applicant } from '@/entities/applicant';
import { Icon } from '@/shared/ui/icon';

interface ApplicantDetailPanelProps {
  detail: Applicant;
}

/**
 * 지원자 상세 패널(우측 슬라이드) + 하단 MOU 처리 액션 바(승인 · 거부 · 기업 전달).
 * 닫기(X)는 링크가 아니라 아이콘이다(목록으로 돌아가는 건 URL을 직접 입력해서 한다).
 * "거부" 버튼도 클릭 동작이 없다 — 거부 사유 모달은 ?variant=reject URL로만 본다.
 * 간격 · 색상은 Figma(node 586:16351)의 값을 그대로 옮겼다.
 */
export function ApplicantDetailPanel({ detail }: ApplicantDetailPanelProps) {
  return (
    <div className="flex w-[720px] max-w-[calc(100vw-220px)] shrink-0 flex-col bg-white">
      <div className="flex flex-1 flex-col gap-[24px] overflow-y-auto px-[32px] py-[24px]">
        <div className="flex items-center justify-between pb-[4px]">
          <p className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
            지원자 상세
          </p>
          <Icon name="close" className="size-[20px] text-[#111]" />
        </div>

        <div className="flex flex-col gap-[8px]">
          <p className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-[#111]">
            {detail.name}
          </p>
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
            {detail.studentId} · {detail.cohort} · {detail.department}
          </p>
        </div>

        <div className="flex flex-col gap-[16px] px-[4px]">
          <div className="flex items-center gap-[12px]">
            <p className="w-[120px] text-[12px] tracking-[-0.12px] text-[#525252]">지원 공고</p>
            <p className="text-[14px] tracking-[-0.14px] text-[#262626]">{detail.jobTitle}</p>
          </div>
          <div className="flex items-center gap-[12px]">
            <p className="w-[120px] text-[12px] tracking-[-0.12px] text-[#525252]">지원 상태</p>
            <p className="text-[14px] tracking-[-0.14px] text-[#262626]">
              {APPLICANT_STATUS_LABEL[detail.status]}
            </p>
          </div>
          <div className="flex items-center gap-[12px]">
            <p className="w-[120px] text-[12px] tracking-[-0.12px] text-[#525252]">연락처</p>
            <p className="text-[14px] tracking-[-0.14px] text-[#262626]">{detail.contact}</p>
          </div>
          <div className="flex items-center gap-[12px]">
            <p className="w-[120px] text-[12px] tracking-[-0.12px] text-[#525252]">제출 시각</p>
            <p className="text-[14px] tracking-[-0.14px] text-[#262626]">
              {detail.submittedAtDetail}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-[8px] rounded-[8px] bg-[#fafafa] p-[20px]">
          <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">지원 동기</p>
          <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">
            {detail.motivation}
          </p>
        </div>

        <div className="flex flex-col gap-[16px]">
          <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">첨부파일</p>
          <div className="flex flex-col gap-[16px]">
            {detail.attachments.map((attachment) => (
              <div key={attachment.id} className="flex items-center justify-between">
                <div className="flex items-center gap-[12px]">
                  <div className="flex size-[40px] items-center justify-center rounded-[8px] bg-[#fef2f2]">
                    <Icon name="file" className="size-[20px] text-[#ef4444]" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-black">
                      {attachment.fileName}
                    </p>
                    <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
                      {attachment.format} · {attachment.fileSize}
                    </p>
                  </div>
                </div>
                <Icon name="download" className="size-[20px] text-[#111]" />
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-[8px]">
          <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">처리 이력</p>
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#404040]">
            {detail.historyLabel}
          </p>
        </div>
      </div>

      <div className="flex h-[156px] shrink-0 flex-col justify-between px-[24px] py-[18px]">
        <div className="flex flex-col gap-[8px]">
          <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#17262e]">
            MOU 공고 처리
          </p>
          <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#617882]">
            동의 기록 확인 완료 · {detail.submittedAtDetail}
          </p>
        </div>
        <div className="flex justify-end gap-[8px]">
          <button
            type="button"
            className="flex items-center justify-center rounded-[8px] bg-[#17627a] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white focus:outline-none"
          >
            승인
          </button>
          <button
            type="button"
            className="flex items-center justify-center rounded-[8px] bg-[#ef4444] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white focus:outline-none"
          >
            거부
          </button>
          <button
            type="button"
            className="flex items-center justify-center rounded-[8px] border border-[#e5e5e5] bg-white px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252] focus:outline-none"
          >
            기업 전달
          </button>
        </div>
      </div>
    </div>
  );
}
