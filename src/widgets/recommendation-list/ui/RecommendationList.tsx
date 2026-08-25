'use client';

import Link from 'next/link';
import { useState } from 'react';

import {
  RecommendationCard,
  type RecommendationItem,
  type UninterestedJob,
  type UninterestedScope,
} from '@/entities/recommendation';
import { Button } from '@/shared/ui/button';

import { RecommendationListSkeleton } from './RecommendationListSkeleton';
import { RecommendationPlaceholder } from './RecommendationPlaceholder';
import { RecommendationSettingCard } from './RecommendationSettingCard';
import { UninterestedManageDialog } from './UninterestedManageDialog';
import { UninterestedScopeDialog } from './UninterestedScopeDialog';

export type RecommendationListStatus = 'empty' | 'error' | 'generating' | 'loading' | 'success';

interface RecommendationListProps {
  initialRecommendations: RecommendationItem[];
  /** 이미 관심 없음으로 설정된 공고. 해제 모달의 초기 목록이다. */
  initialUninterestedJobs?: UninterestedJob[];
  /** 추천 활용 동의 초기값. false면 추천 꺼짐 안내를 보여준다. */
  isInitiallyEnabled?: boolean;
  /** 관심 없음 설정 · 해제 결과를 디자인 검토용으로 강제한다. API 연동 후에는 요청 결과로 대체된다. */
  mockUninterestedResult?: 'error' | 'success';
  onRetry?: () => void;
  /** 마지막 추천 생성 시각 문구(예: "마지막 추천 생성 2026.08.04 14:35"). */
  generatedLabel?: string;
  status: RecommendationListStatus;
}

const UNINTERESTED_ERROR_MESSAGE =
  '관심 없음 설정을 변경할 수 없습니다. 잠시 후 다시 시도해 주세요.';

const PROFILE_LINK_CLASS_NAME =
  'inline-flex h-11 items-center rounded-lg bg-[#17627a] px-6 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-white';

/**
 * 맞춤 추천 위젯. 설정 카드(추천 활용 토글 · 관심 없음 설정) + 목록(로딩 · 오류 · 결과 없음 ·
 * 생성 중 · 추천 꺼짐 · 목록)과 관심 없음 설정 · 해제 모달을 조합한다.
 * 디자인 단계라 목록 · 상태는 호출부에서 목업 값을 넘겨주고, 토글 · 관심 없음은 로컬 상태만 바꾼다.
 * API 연동 이슈에서 이 자리를 `useQuery` · `useMutation` 결과로 교체한다.
 */
export function RecommendationList({
  initialRecommendations,
  initialUninterestedJobs = [],
  isInitiallyEnabled = true,
  mockUninterestedResult = 'success',
  onRetry,
  generatedLabel,
  status,
}: RecommendationListProps) {
  const [recommendations, setRecommendations] = useState(initialRecommendations);
  const [uninterestedJobs, setUninterestedJobs] = useState(initialUninterestedJobs);
  const [isEnabled, setIsEnabled] = useState(isInitiallyEnabled);
  const [scopeTarget, setScopeTarget] = useState<RecommendationItem | null>(null);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleUninterestedConfirm = (scope: UninterestedScope) => {
    if (!scopeTarget) return;

    if (mockUninterestedResult === 'error') {
      setErrorMessage(UNINTERESTED_ERROR_MESSAGE);
      return;
    }

    setRecommendations((current) =>
      current.filter((item) => item.recommendationId !== scopeTarget.recommendationId),
    );
    setUninterestedJobs((current) => [
      ...current,
      {
        uninterestedId: scopeTarget.recommendationId,
        title: scopeTarget.title,
        companyName: scopeTarget.companyName,
        scope,
      },
    ]);
    setScopeTarget(null);
  };

  // ponytail: 해제해도 추천 목록에 다시 넣지 않는다. 다음 추천 생성 결과로 서버가 내려준다.
  const handleRelease = (job: UninterestedJob) => {
    if (mockUninterestedResult === 'error') {
      setErrorMessage(UNINTERESTED_ERROR_MESSAGE);
      return;
    }

    setUninterestedJobs((current) =>
      current.filter((item) => item.uninterestedId !== job.uninterestedId),
    );
  };

  const renderBody = () => {
    if (!isEnabled) {
      return (
        <RecommendationPlaceholder
          iconName="bellOff"
          title="추천 기능이 꺼져 있습니다."
          descriptions={['추천을 활성화하면 프로필을 기반으로 맞춤 공고를 추천해 드립니다.']}
        />
      );
    }

    if (status === 'loading') return <RecommendationListSkeleton />;

    if (status === 'error') {
      return (
        <RecommendationPlaceholder
          iconName="alertCircleLarge"
          role="alert"
          title="추천 생성에 실패했어요."
          descriptions={['일시적인 오류가 발생했어요.', '잠시 후 다시 시도해 주세요.']}
          action={<Button onClick={onRetry}>다시 시도</Button>}
        />
      );
    }

    if (status === 'generating') {
      return (
        <RecommendationPlaceholder
          iconName="sparkle"
          role="status"
          title="추천을 생성하고 있습니다."
          descriptions={[
            '추천에 필요한 프로필 정보를 확인하고 있습니다.',
            '더 정확한 추천을 위해 프로필을 완성해 주세요.',
          ]}
          action={
            <Link href="/profile" className={PROFILE_LINK_CLASS_NAME}>
              프로필 수정하기
            </Link>
          }
        />
      );
    }

    if (status === 'empty' || recommendations.length === 0) {
      return (
        <RecommendationPlaceholder
          iconName="searchLarge"
          title="현재 프로필에 맞는 공고가 없습니다."
          descriptions={[
            '전공, 기술 스택, 관심 분야를 수정하면',
            '더 적합한 공고를 추천받을 수 있습니다.',
          ]}
          action={
            <Link href="/profile" className={PROFILE_LINK_CLASS_NAME}>
              프로필 수정하기
            </Link>
          }
        />
      );
    }

    return (
      <div className="flex flex-col gap-[16px]">
        {recommendations.map((recommendation) => (
          <RecommendationCard
            key={recommendation.recommendationId}
            recommendation={recommendation}
            onUninterested={setScopeTarget}
          />
        ))}
      </div>
    );
  };

  const showGeneratedLabel = isEnabled && status === 'success' && recommendations.length > 0;

  return (
    <section aria-label="맞춤 추천">
      <RecommendationSettingCard
        isEnabled={isEnabled}
        onManageUninterested={() => setIsManageOpen(true)}
        onToggle={setIsEnabled}
      />

      <div className="mt-[24px] flex items-end justify-between gap-[16px]">
        <p className="text-[13px] leading-[1.5] tracking-[-0.13px] text-[#111]">
          오늘의 맞춤 추천{' '}
          <span className="font-bold">{isEnabled ? recommendations.length : 0}개</span>
        </p>
        {showGeneratedLabel && generatedLabel && (
          <span className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#737373]">
            {generatedLabel}
          </span>
        )}
      </div>

      <div className="mt-[12px]">{renderBody()}</div>

      <UninterestedScopeDialog
        isOpen={scopeTarget !== null}
        errorMessage={errorMessage}
        onClose={() => {
          setScopeTarget(null);
          setErrorMessage(null);
        }}
        onConfirm={handleUninterestedConfirm}
        onDismissError={() => setErrorMessage(null)}
      />

      <UninterestedManageDialog
        isOpen={isManageOpen}
        errorMessage={errorMessage}
        onClose={() => {
          setIsManageOpen(false);
          setErrorMessage(null);
        }}
        onDismissError={() => setErrorMessage(null)}
        onRelease={handleRelease}
        uninterestedJobs={uninterestedJobs}
      />
    </section>
  );
}
