'use client';

import Link from 'next/link';

import { mapCompanyDetail, useCompanyDetailQuery } from '@/entities/company';
import { CompanyDetail, type CompanyDetailStatus } from '@/widgets/company-detail';
import { SiteHeader } from '@/widgets/site-header';
import { ApiError } from '@/shared/api';
import { Icon } from '@/shared/ui/icon';

interface CompanyDetailPageProps {
  companyId: string;
}

/**
 * 기업 상세 화면. `GET /api/v1/companies/{id}`(`entities/company`의 `useCompanyDetailQuery`)로
 * 실제 데이터를 불러온다(Issue #156). 학생 · 교사 · 개발자 로그인이면 누구나 호출 가능한 API다.
 *
 * 서버는 삭제된 기업만 404(`COMPANY_NOT_FOUND`)로 응답하고 비공개를 구분해 주지 않는다 —
 * 404를 받으면 "삭제되거나 비공개 처리" 문구로 통합해 보여준다(사용자 확인 완료). 라우트
 * 파라미터가 정수가 아니면(잘못된 링크) 조회 자체를 보내지 않고 바로 같은 안내를 보여준다.
 * "채용 공고"는 회사-공고 연결 조회 API가 없어 항상 빈 배열을 넘긴다 — 별도 이슈에서 연동한다.
 */
export function CompanyDetailPage({ companyId }: CompanyDetailPageProps) {
  const numericId = Number(companyId);
  const isValidId = Number.isInteger(numericId);

  const detailQuery = useCompanyDetailQuery(isValidId ? numericId : null);

  const status: CompanyDetailStatus = !isValidId
    ? 'unavailable'
    : detailQuery.isLoading
      ? 'loading'
      : detailQuery.isError
        ? detailQuery.error instanceof ApiError && detailQuery.error.status === 404
          ? 'unavailable'
          : 'error'
        : 'success';

  const company =
    status === 'success' && detailQuery.data ? mapCompanyDetail(detailQuery.data) : null;

  return (
    <div className="min-h-screen bg-[#f7f7f8]">
      <SiteHeader activeNav="기업 정보" />

      <main className="mx-auto flex max-w-[1280px] flex-col gap-6 px-4 py-10">
        <Link
          href="/companies"
          className="flex items-center gap-1 text-base leading-[1.6] tracking-[-0.16px] text-neutral-600"
        >
          <Icon name="arrowUp" className="h-[13.33px] w-[10px] -rotate-90" />
          기업 목록으로
        </Link>

        <CompanyDetail
          status={status}
          company={company}
          jobs={[]}
          onRetry={() => detailQuery.refetch()}
        />
      </main>
    </div>
  );
}
