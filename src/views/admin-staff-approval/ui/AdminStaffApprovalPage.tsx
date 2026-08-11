import {
  StaffApprovalBadge,
  type StaffApprovalRequest,
  type StaffApprovalStatus,
} from '@/entities/staff-approval';
import { Icon, type IconName } from '@/shared/ui/icon';

type TabValue = 'all' | StaffApprovalStatus;

const TABS: { value: TabValue; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'pending', label: '승인 대기' },
  { value: 'approved', label: '승인 완료' },
  { value: 'rejected', label: '승인 거절' },
];

const TABLE_COLUMNS = ['이름', '이메일', '요청일', '상태', '관리'];

export type ResultVariant = 'no-permission' | 'conflict' | 'error' | 'processing' | 'success';

/** 탭별로 Figma에 각각 캡처된 화면. 탭은 눌러도 필터링되지 않고, ?variant=로만 각 화면을 확인한다. */
export type ListVariant = StaffApprovalStatus;

export type AdminStaffApprovalVariant = ResultVariant | 'reject-reason' | ListVariant;

const RESULT_VARIANTS: readonly ResultVariant[] = [
  'no-permission',
  'conflict',
  'error',
  'processing',
  'success',
];

function isResultVariant(value: AdminStaffApprovalVariant): value is ResultVariant {
  return (RESULT_VARIANTS as readonly string[]).includes(value);
}

const RESULT_CONTENT: Record<
  ResultVariant,
  { icon: IconName; iconClassName: string; title: string; description: string; hasButton: boolean }
> = {
  'no-permission': {
    icon: 'lockOutline',
    iconClassName: 'text-[#525252]',
    title: '접근 권한이 없습니다.',
    description: '현재 계정으로는 가입 요청에 접근할 수 없습니다.',
    hasButton: true,
  },
  conflict: {
    icon: 'alertTriangleFilled',
    iconClassName: 'text-[#f59e0b]',
    title: '다른 관리자가 먼저 요청을 처리했습니다.',
    description:
      '현재 화면의 정보가 최신 정보와 다릅니다.\n최신 정보를 다시 불러온 후 변경 내용을 확인해 주세요.',
    hasButton: true,
  },
  error: {
    icon: 'alertCircleFilled',
    iconClassName: 'text-[#ef4444]',
    title: '가입 요청을 처리하지 못했습니다.',
    description: '일시적인 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.',
    hasButton: true,
  },
  processing: {
    icon: 'spinner',
    iconClassName: 'animate-spin text-[#17627a]',
    title: '가입 요청을 처리하고 있습니다.',
    description: '잠시만 기다려 주세요.',
    hasButton: false,
  },
  success: {
    icon: 'checkCircleFilled',
    iconClassName: 'text-[#22c55e]',
    title: '가입 요청을 처리했습니다.',
    description: '처리 결과가 요청자에게 반영되었습니다.',
    hasButton: true,
  },
};

interface AdminStaffApprovalPageProps {
  requests: StaffApprovalRequest[];
  /** ?variant= 값. 거절 사유 입력창과 처리 결과 화면을 확인용으로 바로 띄운다. */
  variant?: AdminStaffApprovalVariant;
}

export function AdminStaffApprovalPage({ requests, variant }: AdminStaffApprovalPageProps) {
  const tab: TabValue =
    variant === 'pending' || variant === 'approved' || variant === 'rejected' ? variant : 'all';
  const showRejectReason = variant === 'reject-reason';
  const result = variant && isResultVariant(variant) ? variant : null;

  const isEmpty = requests.length === 0;
  const filtered = tab === 'all' ? requests : requests.filter((request) => request.status === tab);

  return (
    <div className="bg-[#fafafa]">
      <header className="flex h-[80px] items-center justify-between border-b border-[#e5e5e5] bg-white px-[40px]">
        <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#17212b]">
          {isEmpty ? '사용자 관리' : '교직원 가입 관리'}
        </p>
        <div className="flex items-center gap-[10px]">
          <span className="size-[32px] rounded-full bg-[#f5f5f5]" />
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
            {isEmpty ? '관리자' : '개발자 · 외 1개'}
          </p>
          <Icon name="chevronRight" className="h-[12px] w-[24px] rotate-90 text-[#525252]" />
        </div>
      </header>

      <main className="flex flex-col gap-[24px] px-[40px] py-[40px]">
        <div className="flex flex-col gap-[8px]">
          <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-[#111]">
            교직원 가입 요청
          </h1>
          <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#404040]">
            교직원의 관리자 서비스 가입 요청을 승인하거나 거절합니다.
          </p>
        </div>

        <div className="flex border-b border-[#e5e5e5] pt-[24px]">
          {TABS.map((item) => (
            <button
              key={item.value}
              type="button"
              className={`border-b-2 px-[16px] py-[12px] text-[16px] leading-[1.6] tracking-[-0.16px] focus:outline-none ${
                tab === item.value
                  ? 'border-[#17627a] font-semibold text-[#17627a]'
                  : 'border-transparent text-[#525252]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {isEmpty ? (
          /* Figma는 이 상태를 흰 테두리 카드 없이 페이지 배경 위에 바로 그린다. */
          <div className="flex min-h-[563px] flex-col items-center justify-center gap-[24px]">
            <Icon name="fileSearch" className="size-[72px] text-[#525252]" />
            <div className="flex flex-col items-center gap-[12px] text-center">
              <p className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
                가입 요청이 없습니다.
              </p>
              <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#525252]">
                현재 승인이 필요한 교직원 가입 요청이 없습니다.
                <br />
                새로운 요청이 접수되면 이곳에 표시됩니다.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col rounded-[12px] border border-[#e5e5e5] bg-white">
            <div className="flex h-[62px] items-center bg-[#fafafa]">
              {TABLE_COLUMNS.map((column) => (
                <div key={column} className="flex-1 pr-[8px] pl-[16px]">
                  <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252]">
                    {column}
                  </p>
                </div>
              ))}
            </div>
            {filtered.map((request) => (
              <div key={request.id} className="flex h-[62px] items-center">
                <div className="flex-1 pr-[8px] pl-[16px]">
                  <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                    {request.name}
                  </p>
                </div>
                <div className="flex-1 pr-[8px] pl-[16px]">
                  <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                    {request.email}
                  </p>
                </div>
                <div className="flex-1 pr-[8px] pl-[16px]">
                  <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                    {request.requestedAt}
                  </p>
                </div>
                <div className="flex-1 pr-[8px] pl-[16px]">
                  <StaffApprovalBadge status={request.status} />
                </div>
                <div className="flex-1 pr-[8px] pl-[16px]">
                  {request.status === 'pending' ? (
                    <div className="flex gap-[8px]">
                      <button
                        type="button"
                        className="rounded-[8px] bg-[#17627a] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white focus:outline-none"
                      >
                        승인
                      </button>
                      <button
                        type="button"
                        className="rounded-[8px] border border-[#ef4444] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#ef4444] focus:outline-none"
                      >
                        거절
                      </button>
                    </div>
                  ) : (
                    <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
                      처리 완료
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-[8px] bg-[#eaf6f9] p-[16px]">
          <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#17627a]">
            가입 요청은 관리자만 처리할 수 있습니다. 승인 완료 전 교직원은 Admin Web에 로그인할 수
            없습니다.
          </p>
        </div>
      </main>

      {showRejectReason && (
        <div className="fixed inset-0 z-50">
          {/* Figma는 dim이 사이드바(220px)를 덮지 않고 콘텐츠 영역에만 적용된다. */}
          <div className="absolute inset-y-0 right-0 left-[220px] bg-black/24" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-[480px] rounded-[16px] bg-white drop-shadow-[0px_16px_20px_rgba(23,37,45,0.16)]">
              <div className="flex h-[72px] items-center px-[28px]">
                <p className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
                  가입 거절
                </p>
              </div>
              <div className="flex flex-col gap-[8px] px-[28px] pb-[24px]">
                <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                  거절 사유
                </p>
                <textarea
                  placeholder="거절 사유를 입력해 주세요."
                  className="h-[180px] w-full resize-none rounded-[8px] border border-[#e5e5e5] p-[13px] text-[14px] leading-[1.5] tracking-[-0.14px] text-[#111] placeholder:text-[#737373] focus:outline-none"
                />
              </div>
              <div className="flex h-[76px] items-center justify-end gap-[16px] border-t border-[#e5e5e5] px-[28px]">
                <button
                  type="button"
                  className="rounded-[8px] border border-[#e5e5e5] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252] focus:outline-none"
                >
                  취소
                </button>
                <button
                  type="button"
                  className="rounded-[8px] bg-[#ef4444] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white focus:outline-none"
                >
                  거절
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="fixed inset-0 z-50">
          {/* Figma는 dim이 사이드바(220px)를 덮지 않고 콘텐츠 영역에만 적용된다. */}
          <div className="absolute inset-y-0 right-0 left-[220px] bg-black/24" />
          <div className="absolute inset-0 flex items-center justify-center">
            {/* 버튼이 없는 처리중 상태만 Figma에서 세로 패딩이 40px로 더 크다. */}
            <div
              className={`flex w-[520px] flex-col items-center gap-[32px] rounded-[16px] bg-white shadow-[0px_16px_40px_-8px_rgba(23,37,45,0.16)] ${
                RESULT_CONTENT[result].hasButton ? 'p-[32px]' : 'px-[32px] py-[40px]'
              }`}
            >
              <Icon
                name={RESULT_CONTENT[result].icon}
                className={`size-[64px] shrink-0 ${RESULT_CONTENT[result].iconClassName}`}
              />
              <div className="flex flex-col items-center gap-[16px] text-center">
                <p className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
                  {RESULT_CONTENT[result].title}
                </p>
                <p className="text-[16px] leading-[1.6] tracking-[-0.16px] whitespace-pre-line text-[#525252]">
                  {RESULT_CONTENT[result].description}
                </p>
              </div>
              {RESULT_CONTENT[result].hasButton && (
                <button
                  type="button"
                  className="w-full rounded-[8px] bg-[#17627a] px-[24px] py-[12px] text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-white focus:outline-none"
                >
                  확인
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
