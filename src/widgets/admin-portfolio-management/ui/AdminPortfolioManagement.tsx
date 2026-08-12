'use client';

import { useMemo, useState } from 'react';

import {
  type PortfolioRequest,
  type PortfolioRequestStatus,
  type PortfolioSubmission,
} from '@/entities/portfolio-request';
import {
  PortfolioRequestDeleteDialog,
  PortfolioRequestFormPanel,
} from '@/features/manage-portfolio-request';
import { DropdownField } from '@/shared/ui/dropdown-field';
import { Icon } from '@/shared/ui/icon';

export type AdminPortfolioListStatus = 'loading' | 'error' | 'empty' | 'success';

const PORTFOLIO_REQUEST_STATUS_LABEL: Record<PortfolioRequestStatus, string> = {
  DRAFT: '임시 저장',
  OPEN: '진행 중',
  CLOSED: '종료',
};

interface AdminPortfolioManagementProps {
  initialStatus: AdminPortfolioListStatus;
  requests: PortfolioRequest[];
  submissions: PortfolioSubmission[];
}

export function AdminPortfolioManagement({
  initialStatus,
  requests,
  submissions,
}: AdminPortfolioManagementProps) {
  const [listStatus, setListStatus] = useState(initialStatus);
  const [items, setItems] = useState(requests);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<PortfolioRequestStatus | 'ALL'>('ALL');
  const [cohort, setCohort] = useState('ALL');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRequest, setEditingRequest] = useState<PortfolioRequest | null>(null);
  const [deletingRequest, setDeletingRequest] = useState<PortfolioRequest | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<PortfolioRequest | null>(null);

  const filteredItems = useMemo(
    () =>
      items.filter(
        (item) =>
          item.title.includes(query) &&
          (status === 'ALL' || item.status === status) &&
          (cohort === 'ALL' || item.target.includes(cohort)),
      ),
    [cohort, items, query, status],
  );

  const handleSave = (title: string) => {
    if (editingRequest) {
      setItems((current) =>
        current.map((item) =>
          item.requestId === editingRequest.requestId ? { ...item, title } : item,
        ),
      );
      setEditingRequest(null);
      setIsFormOpen(false);
      return;
    }

    setItems((current) => [
      {
        requestId: Date.now(),
        title,
        duePeriod: '08.12–08.31',
        target: '10기 전체',
        submittedCount: 0,
        targetCount: 30,
        status: 'DRAFT',
        createdAt: '2026.08.11',
      },
      ...current,
    ]);
    setListStatus('success');
    setIsFormOpen(false);
  };

  if (selectedRequest) {
    return (
      <PortfolioSubmissionStatus
        request={selectedRequest}
        submissions={submissions}
        initialStatus={listStatus}
        onBack={() => setSelectedRequest(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminPortfolioHeader />
      <div className="px-4 py-8 xl:px-6 xl:py-10 2xl:px-10">
        <div className="w-full max-w-[1620px]">
          <PageHeading
            title="포트폴리오 요청 관리"
            description="학생 대상 포트폴리오 수합 요청을 등록하고 관리합니다."
          />

          <div className="mt-8 flex gap-3 xl:gap-4 2xl:gap-5">
            <label className="flex h-14 min-w-0 flex-1 items-center gap-4 rounded-lg border border-neutral-200 bg-white px-4">
              <Icon name="search" className="size-5 text-neutral-600" />
              <span className="sr-only">요청 제목 검색</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="요청 제목으로 검색해 보세요."
                className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-neutral-600"
              />
            </label>
            <FilterSelect
              ariaLabel="진행 상태"
              value={status}
              onChange={(value) => setStatus(value as PortfolioRequestStatus | 'ALL')}
              options={[
                ['ALL', '진행 상태'],
                ['OPEN', '진행 중'],
                ['DRAFT', '임시 저장'],
                ['CLOSED', '종료'],
              ]}
            />
            <FilterSelect
              ariaLabel="대상 기수"
              value={cohort}
              onChange={setCohort}
              options={[
                ['ALL', '대상 기수'],
                ['8기', '8기'],
                ['9기', '9기'],
                ['10기', '10기'],
              ]}
            />
            <button
              type="button"
              className="bg-primary-700 flex h-14 shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-xs leading-[1.4] font-medium tracking-[-0.14px] whitespace-nowrap text-white xl:px-6 xl:text-sm 2xl:px-8"
              onClick={() => {
                setEditingRequest(null);
                setIsFormOpen(true);
              }}
            >
              <span aria-hidden="true" className="text-lg leading-none font-light">
                +
              </span>
              수합 요청 등록
            </button>
          </div>

          <div className="mt-8">
            {listStatus === 'loading' ? (
              <PortfolioState
                variant="loading"
                title="정보를 불러오는 중입니다."
                description="잠시만 기다려 주세요."
              />
            ) : null}
            {listStatus === 'error' ? (
              <PortfolioState
                variant="error"
                title="포트폴리오 요청을 불러올 수 없습니다."
                description="잠시 후 다시 시도해 주세요."
              />
            ) : null}
            {listStatus === 'empty' ? (
              <PortfolioState
                variant="empty"
                title="검색 결과가 없습니다."
                description="검색어를 확인하거나 다른 키워드로 검색해보세요."
              />
            ) : null}
            {listStatus === 'success' ? (
              <>
                <p className="mb-6 text-sm tracking-[-0.14px] text-neutral-900">
                  총 {filteredItems.length}개 요청
                </p>
                {filteredItems.length > 0 ? (
                  <PortfolioRequestTable
                    requests={filteredItems}
                    onShowSubmissions={setSelectedRequest}
                    onEdit={(request) => {
                      setEditingRequest(request);
                      setIsFormOpen(true);
                    }}
                    onDelete={setDeletingRequest}
                  />
                ) : (
                  <PortfolioState
                    variant="empty"
                    title="검색 결과가 없습니다."
                    description="검색어를 확인하거나 다른 키워드로 검색해보세요."
                  />
                )}
              </>
            ) : null}
          </div>
        </div>
      </div>

      {isFormOpen ? (
        <PortfolioRequestFormPanel
          initialTitle={editingRequest?.title}
          onClose={() => {
            setEditingRequest(null);
            setIsFormOpen(false);
          }}
          onSubmit={handleSave}
        />
      ) : null}
      <PortfolioRequestDeleteDialog
        request={deletingRequest}
        onCancel={() => setDeletingRequest(null)}
        onConfirm={(requestId) => {
          setItems((current) => current.filter((item) => item.requestId !== requestId));
          setDeletingRequest(null);
        }}
      />
    </div>
  );
}

function AdminPortfolioHeader() {
  return (
    <header className="flex h-20 items-center justify-between border-b border-neutral-200 bg-white px-4 xl:px-6 2xl:px-10">
      <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-900">포트폴리오 관리</p>
      <div className="flex items-center gap-3 overflow-hidden">
        <span className="bg-primary-100 size-8 shrink-0 rounded-full" aria-hidden="true" />
        <p className="text-sm leading-[1.5] tracking-[-0.14px] whitespace-nowrap text-neutral-600">
          개발자 · 외 1개
        </p>
        <Icon name="chevronRight" className="h-3 w-6 shrink-0 rotate-90 text-neutral-500" />
      </div>
    </header>
  );
}

function PageHeading({ title, description }: { title: string; description: string }) {
  return (
    <header>
      <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-neutral-900">
        {title}
      </h1>
      <p className="mt-2 text-base leading-[1.6] tracking-[-0.16px] text-neutral-700">
        {description}
      </p>
    </header>
  );
}

function FilterSelect({
  ariaLabel,
  value,
  options,
  onChange,
}: {
  ariaLabel: string;
  value: string;
  options: ReadonlyArray<readonly [string, string]>;
  onChange: (value: string) => void;
}) {
  return (
    <DropdownField
      ariaLabel={ariaLabel}
      className="w-[160px] shrink-0 xl:w-[190px] 2xl:w-[232px]"
      value={value}
      placeholder={ariaLabel}
      onChange={onChange}
      options={options.map(([optionValue, label]) => ({ value: optionValue, label }))}
    />
  );
}

function PortfolioRequestTable({
  requests,
  onShowSubmissions,
  onEdit,
  onDelete,
}: {
  requests: PortfolioRequest[];
  onShowSubmissions: (request: PortfolioRequest) => void;
  onEdit: (request: PortfolioRequest) => void;
  onDelete: (request: PortfolioRequest) => void;
}) {
  return (
    <div
      className="overflow-x-auto rounded-lg bg-white"
      role="region"
      aria-label="포트폴리오 요청 목록"
      tabIndex={0}
    >
      <table className="w-[1620px] min-w-[1620px] table-fixed text-left text-sm">
        <colgroup>
          <col className="w-[350px]" />
          <col className="w-[300px]" />
          <col className="w-[190px]" />
          <col className="w-[210px]" />
          <col className="w-[180px]" />
          <col className="w-[150px]" />
          <col className="w-[240px]" />
        </colgroup>
        <thead className="h-[52px] bg-neutral-50 text-neutral-700">
          <tr>
            <th className="pr-4 pl-6 font-medium">요청 제목</th>
            <th className="pr-4 pl-6 font-medium">제출 기간</th>
            <th className="pr-4 pl-6 font-medium">대상</th>
            <th className="pr-4 pl-6 font-medium">제출 현황</th>
            <th className="pr-4 pl-6 font-medium">진행 상태</th>
            <th className="pr-4 pl-6 font-medium">등록일</th>
            <th className="pr-4 pl-6 font-medium">관리</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr
              key={request.requestId}
              className="h-[60px] border-t border-neutral-200 text-neutral-900"
            >
              <td className="truncate pr-4 pl-6">{request.title}</td>
              <td className="truncate pr-4 pl-6">{request.duePeriod}</td>
              <td className="truncate pr-4 pl-6">{request.target}</td>
              <td className="truncate pr-4 pl-6">
                {request.submittedCount} / {request.targetCount}
              </td>
              <td className="truncate pr-4 pl-6">
                {PORTFOLIO_REQUEST_STATUS_LABEL[request.status]}
              </td>
              <td className="truncate pr-4 pl-6">{request.createdAt}</td>
              <td className="text-primary-700 truncate pr-4 pl-6 whitespace-nowrap">
                <button type="button" onClick={() => onShowSubmissions(request)}>
                  제출 현황
                </button>
                <span className="px-1.5 text-neutral-300">·</span>
                <button type="button" onClick={() => onEdit(request)}>
                  수정
                </button>
                <span className="px-1.5 text-neutral-300">·</span>
                <button type="button" onClick={() => onDelete(request)}>
                  삭제
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PortfolioSubmissionStatus({
  request,
  submissions,
  initialStatus,
  onBack,
}: {
  request: PortfolioRequest;
  submissions: PortfolioSubmission[];
  initialStatus: AdminPortfolioListStatus;
  onBack: () => void;
}) {
  const [status] = useState(initialStatus);
  const [query, setQuery] = useState('');
  const [submissionFilter, setSubmissionFilter] = useState('ALL');
  const filtered = submissions.filter(
    (submission) =>
      (submission.studentName.includes(query) || submission.studentNumber.includes(query)) &&
      (submissionFilter === 'ALL' || submission.status === submissionFilter),
  );
  const submittedCount = submissions.filter((item) => item.status === 'SUBMITTED').length;
  const percent =
    submissions.length === 0 ? 0 : Math.round((submittedCount / submissions.length) * 100);

  return (
    <div className="min-h-screen bg-neutral-50">
      <AdminPortfolioHeader />
      <div className="px-4 py-8 xl:px-6 xl:py-10 2xl:px-10">
        <div className="w-full max-w-[1620px]">
          <button type="button" onClick={onBack} className="text-primary-700 mb-5 text-sm">
            ← 요청 목록으로 돌아가기
          </button>
          <PageHeading
            title="포트폴리오 제출 현황"
            description={`${request.title} · 대상 ${request.targetCount}명`}
          />
          <div className="mt-8 flex gap-3 xl:gap-4 2xl:gap-5">
            <label className="flex h-14 min-w-0 flex-1 items-center gap-4 rounded-lg border border-neutral-200 bg-white px-4">
              <Icon name="search" className="size-5 text-neutral-600" />
              <span className="sr-only">학생 검색</span>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="이름 또는 학번으로 검색해 보세요."
                className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-neutral-600"
              />
            </label>
            <FilterSelect
              ariaLabel="제출 상태"
              value={submissionFilter}
              onChange={setSubmissionFilter}
              options={[
                ['ALL', '제출 상태'],
                ['SUBMITTED', '제출'],
                ['NOT_SUBMITTED', '미제출'],
              ]}
            />
            <button
              type="button"
              className="bg-primary-700 h-14 shrink-0 rounded-lg px-4 text-xs leading-[1.4] font-medium tracking-[-0.14px] whitespace-nowrap text-white xl:px-6 xl:text-sm 2xl:px-8"
            >
              자료 일괄 다운로드
            </button>
          </div>

          <div className="mt-6 grid w-full max-w-[580px] grid-cols-3 gap-3 xl:gap-5">
            <SummaryCard label="제출" value={`${submittedCount}명`} />
            <SummaryCard label="미제출" value={`${submissions.length - submittedCount}명`} />
            <SummaryCard label="제출률" value={`${percent}%`} />
          </div>

          <div className="mt-7">
            {status === 'loading' ? (
              <PortfolioState
                variant="loading"
                title="정보를 불러오는 중입니다."
                description="잠시만 기다려 주세요."
              />
            ) : null}
            {status === 'error' ? (
              <PortfolioState
                variant="error"
                title="제출 현황을 불러올 수 없습니다."
                description="잠시 후 다시 시도해 주세요."
              />
            ) : null}
            {status === 'empty' || (status === 'success' && filtered.length === 0) ? (
              <PortfolioState
                variant="empty"
                title="포트폴리오 제출 자료가 없습니다."
                description="제출된 자료가 생기면 이곳에서 확인할 수 있습니다."
              />
            ) : null}
            {status === 'success' && filtered.length > 0 ? (
              <div
                className="overflow-x-auto rounded-lg bg-white"
                role="region"
                aria-label="포트폴리오 제출 현황 목록"
                tabIndex={0}
              >
                <table className="w-[1620px] min-w-[1620px] table-fixed text-left text-sm">
                  <colgroup>
                    <col className="w-[350px]" />
                    <col className="w-[190px]" />
                    <col className="w-[210px]" />
                    <col className="w-[180px]" />
                    <col className="w-[300px]" />
                    <col className="w-[150px]" />
                    <col className="w-[240px]" />
                  </colgroup>
                  <thead className="h-[52px] bg-neutral-50 text-neutral-700">
                    <tr>
                      <th className="pr-4 pl-6 font-medium">학생</th>
                      <th className="pr-4 pl-6 font-medium">학번</th>
                      <th className="pr-4 pl-6 font-medium">기수, 학과</th>
                      <th className="pr-4 pl-6 font-medium">제출 상태</th>
                      <th className="pr-4 pl-6 font-medium">제출 시각</th>
                      <th className="pr-4 pl-6 font-medium">자료 유형</th>
                      <th className="pr-4 pl-6 font-medium">프로필</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((submission) => (
                      <tr
                        key={submission.submissionId}
                        className="h-16 border-t border-neutral-200"
                      >
                        <td className="truncate pr-4 pl-6">{submission.studentName}</td>
                        <td className="truncate pr-4 pl-6">{submission.studentNumber}</td>
                        <td className="truncate pr-4 pl-6">{submission.cohortAndDepartment}</td>
                        <td className="truncate pr-4 pl-6">
                          {submission.status === 'SUBMITTED' ? '제출' : '미제출'}
                        </td>
                        <td className="truncate pr-4 pl-6">{submission.submittedAt ?? '—'}</td>
                        <td className="truncate pr-4 pl-6">{submission.materialType ?? '—'}</td>
                        <td className="truncate pr-4 pl-6">
                          <button type="button" className="text-primary-700 whitespace-nowrap">
                            프로필 보기
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white px-5 py-4">
      <p className="text-xs text-neutral-600">{label}</p>
      <p className="mt-2 text-base font-medium text-neutral-900">{value}</p>
    </div>
  );
}

function PortfolioState({
  variant,
  title,
  description,
}: {
  variant: 'empty' | 'error' | 'loading';
  title: string;
  description: string;
}) {
  const iconName =
    variant === 'loading' ? 'spinner' : variant === 'error' ? 'alertCircleLarge' : 'searchLarge';

  return (
    <section
      aria-live={variant === 'loading' ? 'polite' : undefined}
      className="flex min-h-[420px] flex-col items-center justify-center text-center"
    >
      <Icon
        name={iconName}
        className={`mb-6 size-12 text-neutral-500 ${variant === 'loading' ? 'animate-spin' : ''}`}
      />
      <h2 className="text-base leading-[1.5] font-semibold tracking-[-0.16px] text-neutral-900">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600">
        {description}
      </p>
    </section>
  );
}
