import Link from 'next/link';

import {
  PortfolioSubmissionForm,
  type PortfolioSubmissionFormVariant,
} from '@/features/submit-portfolio';
import { Icon } from '@/shared/ui/icon';
import { PageState } from '@/shared/ui/page-state';
import { SiteHeader } from '@/widgets/site-header';

interface PortfolioDetailPageProps {
  requestId: string;
  searchParams: Promise<{ variant?: string }>;
}

const FORM_VARIANTS: Record<string, PortfolioSubmissionFormVariant> = {
  'size-error': 'size-error',
  'upload-error': 'upload-error',
  uploading: 'uploading',
};

/** 학생 포트폴리오 제출 상세의 디자인 상태를 목업 데이터로 검토하는 정적 화면. */
export async function PortfolioDetailPage({ requestId, searchParams }: PortfolioDetailPageProps) {
  const { variant } = await searchParams;
  const isCompleted = variant === 'completed';
  const isUnavailable = variant === 'unavailable';

  return (
    <div className="min-h-screen bg-neutral-100">
      <SiteHeader activeNav="포트폴리오" />
      <main className="mx-auto w-full max-w-[1312px] px-4 pt-10 pb-[120px]">
        <header className="px-1">
          <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-neutral-900">
            {isCompleted ? '제출 완료' : '포트폴리오 제출'}
          </h1>
          <p className="mt-2 text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
            {isCompleted
              ? '포트폴리오가 정상적으로 제출되었습니다.'
              : '포트폴리오 파일 또는 외부 링크를 등록한 뒤 제출해 주세요.'}
          </p>
        </header>

        {variant === 'loading' ? (
          <div className="mt-8 rounded-lg bg-white">
            <PageState
              variant="loading"
              title="포트폴리오 요청을 불러오는 중입니다."
              description="잠시만 기다려 주세요."
            />
          </div>
        ) : null}
        {variant === 'error' ? (
          <div className="mt-8 rounded-lg bg-white">
            <PageState
              variant="error"
              title="포트폴리오 요청을 불러올 수 없습니다."
              description="잠시 후 다시 시도해 주세요."
            />
            <div className="flex justify-center pb-12">
              <Link
                href={`/portfolios/${requestId}`}
                className="bg-primary-700 inline-flex h-11 items-center justify-center rounded-lg px-6 text-sm font-medium text-white"
              >
                다시 시도
              </Link>
            </div>
          </div>
        ) : null}

        {variant !== 'loading' && variant !== 'error' ? (
          <div className="mt-8 flex flex-col gap-8">
            {!isCompleted && !isUnavailable ? <PortfolioRequestSummary /> : null}
            {isUnavailable ? (
              <section className="rounded-2xl bg-white px-8 py-9">
                <h2 className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
                  제출 불가 상태
                </h2>
                <p className="mt-3 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-600">
                  제출 대상이 아니거나 제출 기간이 종료되었습니다.
                </p>
              </section>
            ) : (
              <PortfolioSubmissionInfo isCompleted={isCompleted} />
            )}

            {isCompleted ? (
              <CompletedPortfolioMaterials />
            ) : isUnavailable ? (
              <fieldset disabled>
                <PortfolioSubmissionForm />
              </fieldset>
            ) : (
              <PortfolioSubmissionForm variant={FORM_VARIANTS[variant ?? 'default'] ?? 'default'} />
            )}
          </div>
        ) : null}
      </main>
    </div>
  );
}

function PortfolioRequestSummary() {
  return (
    <section className="rounded-lg bg-white px-6 py-8">
      <span className="bg-primary-100 text-primary-700 inline-flex rounded-2xl px-3 py-1.5 text-xs leading-[1.5] font-semibold tracking-[-0.12px]">
        포트폴리오 제출 요청
      </span>
      <h2 className="mt-2 text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
        2026 상반기 고졸 신입 개발자 포트폴리오 수합
      </h2>
      <p className="mt-2 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">
        신입 개발자 채용을 위한 포트폴리오를 제출해 주세요.
      </p>
    </section>
  );
}

function PortfolioSubmissionInfo({ isCompleted }: { isCompleted: boolean }) {
  return (
    <section className="rounded-lg bg-white px-8 py-6">
      <h2 className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
        제출 정보
      </h2>
      <div className="mt-6 grid grid-cols-2 gap-16 text-sm tracking-[-0.14px] max-sm:grid-cols-1 max-sm:gap-6">
        <div>
          <p className="leading-[1.4] font-medium text-neutral-900">제출 기간</p>
          <p className="mt-2 leading-[1.5] text-neutral-600">2026.08.01 09:00 ~ 2026.08.31 18:00</p>
        </div>
        <div>
          <p className="leading-[1.4] font-medium text-neutral-900">제출 상태</p>
          <p className="mt-2 leading-[1.5] text-neutral-600">
            {isCompleted ? '제출 완료' : '제출 전'}
          </p>
        </div>
      </div>
    </section>
  );
}

function CompletedPortfolioMaterials() {
  return (
    <section className="min-h-[420px] rounded-lg bg-white p-8">
      <h2 className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
        첨부 파일
      </h2>
      <div className="mt-4 flex min-h-[61px] items-center gap-3 rounded-lg border border-neutral-200 p-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
          <Icon name="file" className="h-[18.67px] w-[15.33px] text-neutral-600" />
        </span>
        <div>
          <p className="text-sm leading-[1.4] font-medium tracking-[-0.14px] text-neutral-900">
            제목 없는 디자인 (4).png
          </p>
          <p className="mt-1 text-xs leading-[1.5] tracking-[-0.12px] text-neutral-600">1.6 MB</p>
        </div>
      </div>

      <h2 className="mt-8 text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
        등록된 링크
      </h2>
      <a
        href="https://github.com/geti-student"
        target="_blank"
        rel="noreferrer"
        className="mt-4 flex h-14 items-center gap-3 rounded-lg border border-neutral-200 px-4 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-900"
      >
        <Icon name="externalLink" className="size-4 text-neutral-600" />
        GitHub · github.com/geti-student
      </a>
    </section>
  );
}
