import { type Applicant } from '@/entities/applicant';
import { Icon } from '@/shared/ui/icon';

import { ApplicantDetailPanel } from './ApplicantDetailPanel';
import { ApplicantFilterBar } from './ApplicantFilterBar';
import { ApplicantTable } from './ApplicantTable';
import { DownloadModal } from './DownloadModal';
import { RejectReasonModal } from './RejectReasonModal';

interface AdminApplicantPageProps {
  applicants: Applicant[];
  /** /admin/applicants/[applicantId]로 들어왔을 때 그 id가 있으면 상세 패널을 목록 위에 띄운다. */
  detailId?: string;
  /** id에 해당하는 지원자. 못 찾으면 패널을 띄우지 않는다(목록만 보인다). */
  detail?: Applicant;
  /**
   * ?variant=download(목록) 또는 ?variant=reject(상세)일 때 그 위에 뜨는 모달을 항상 띄운다.
   * Figma가 캡처한 4개 화면(목록 · 상세 · 거부 사유 · 자료 다운로드)을 각각 클릭 없이
   * URL만으로 바로 볼 수 있게 하기 위한 것이라, 버튼을 눌러서 여는 방식이 아니다.
   */
  variant?: 'download' | 'reject';
}

/**
 * 지원자 관리 화면. 헤더 + 타이틀 + 필터 바(`ApplicantFilterBar`) + 지원자 테이블(`ApplicantTable`) +
 * 상세 패널(`ApplicantDetailPanel`) + 거부 사유 모달(`RejectReasonModal`) +
 * 자료 일괄 다운로드 모달(`DownloadModal`)을 조합하는 페이지 레이아웃만 담당한다.
 * 각 조각의 상태 · 동작은 해당 컴포넌트 파일에 있다.
 *
 * Figma가 캡처한 4개 화면(목록 · 상세 · 거부 사유 · 자료 다운로드)은 서로 클릭으로 이동하지 않고
 * 전부 독립된 URL로만 접근한다 — 상세: /admin/applicants/[applicantId], 거부 사유 · 자료
 * 다운로드는 ?variant= 쿼리(Discord 게시 관리의 ?variant=error와 동일한 패턴).
 * 간격 · 색상은 Figma(node 586:15965)의 값을 그대로 옮겼다.
 * 지원자 승인 · 거부 · 다운로드 API 연동은 별도 이슈에서 진행한다.
 */
export function AdminApplicantPage({
  applicants,
  detailId,
  detail,
  variant,
}: AdminApplicantPageProps) {
  const isDownloadModalOpen = variant === 'download';
  const isRejectModalOpen = variant === 'reject';

  return (
    <div className="bg-[#fafafa]">
      <header className="flex h-[80px] items-center justify-between border-b border-[#e5e5e5] bg-white px-[40px]">
        <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">지원자 관리</p>
        <div className="flex items-center gap-[12px]">
          <span className="size-[32px] rounded-full bg-[#eaf6f9]" />
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
            개발자 · 외 1개
          </p>
          <Icon name="chevronRight" className="h-[12px] w-[24px] rotate-90 text-[#525252]" />
        </div>
      </header>

      <main className="flex flex-col gap-[24px] px-[40px] py-[40px]">
        <div className="flex flex-col gap-[32px]">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-[8px]">
              <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-[#111]">
                지원자 관리
              </h1>
              <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#404040]">
                공고별 지원자를 조회하고 검토 상태를 관리합니다.
              </p>
            </div>
            <button
              type="button"
              className="flex h-[56px] items-center justify-center rounded-[8px] bg-[#17627a] px-[32px] py-[16px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white focus:outline-none"
            >
              자료 일괄 다운로드
            </button>
          </div>

          <ApplicantFilterBar />
        </div>

        <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#404040]">
          총 {applicants.length}명
        </p>

        <div className="flex flex-col gap-[24px]">
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#111]">
            총 {applicants.length}명
          </p>

          <ApplicantTable applicants={applicants} />
        </div>
      </main>

      {detailId && detail && (
        <div className="fixed inset-0 z-40 flex">
          <div className="ml-[220px] flex-1 bg-black/24" />
          <ApplicantDetailPanel detail={detail} />
          {isRejectModalOpen && <RejectReasonModal />}
        </div>
      )}

      {isDownloadModalOpen && <DownloadModal applicants={applicants} />}
    </div>
  );
}
