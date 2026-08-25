import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { RecommendationItem, UninterestedJob } from '@/entities/recommendation';

import { RecommendationList } from './RecommendationList';

const RECOMMENDATIONS: RecommendationItem[] = [
  {
    recommendationId: 'rec-1',
    companyName: '테스트 기업 1',
    title: '첫 번째 추천 공고',
    fit: 'FIT',
    tags: ['인턴', '외부 지원'],
    subLabel: '웹 프론트엔드 · 판교',
    reasons: ['React, TypeScript 기술 스택과 일치합니다.'],
    deadlineLabel: '마감 D-5',
    detailHref: '/jobs/external/1',
  },
  {
    recommendationId: 'rec-2',
    companyName: '테스트 기업 2',
    title: '두 번째 추천 공고',
    fit: 'UNFIT',
    tags: ['정규직'],
    subLabel: '백엔드 · 광주',
    reasons: ['현재 학년에서 지원 가능한 공고입니다.'],
    deadlineLabel: '마감 D-12',
    detailHref: '/jobs/school/2',
  },
];

const UNINTERESTED_JOBS: UninterestedJob[] = [
  {
    uninterestedId: 'rec-3',
    title: '세 번째 추천 공고',
    companyName: '테스트 기업 3',
    scope: 'SIMILAR_JOBS',
  },
];

describe('RecommendationList', () => {
  it('추천 개수와 카드, 적합도와 추천 근거를 보여준다', () => {
    render(
      <RecommendationList
        initialRecommendations={RECOMMENDATIONS}
        generatedLabel="마지막 추천 생성 2026.08.04 14:35"
        status="success"
      />,
    );

    expect(screen.getByText('오늘의 맞춤 추천')).toHaveTextContent('2개');
    expect(screen.getByText('마지막 추천 생성 2026.08.04 14:35')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '첫 번째 추천 공고' })).toHaveAttribute(
      'href',
      '/jobs/external/1',
    );
    expect(screen.getByText('부적합')).toBeInTheDocument();
    expect(screen.getByText('React, TypeScript 기술 스택과 일치합니다.')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: '공고 보기' })).toHaveLength(2);
  });

  it('추천 활용을 끄면 안내 화면으로 바꾸고, 다시 켜면 목록을 보여준다', () => {
    render(<RecommendationList initialRecommendations={RECOMMENDATIONS} status="success" />);

    const toggle = screen.getByRole('switch', { name: '전공·기술 스택 추천 활용' });
    fireEvent.click(toggle);

    expect(screen.getByText('추천 기능이 꺼져 있습니다.')).toBeInTheDocument();
    expect(screen.getByText('활용 안 함')).toBeInTheDocument();
    expect(screen.getByText('오늘의 맞춤 추천')).toHaveTextContent('0개');
    expect(toggle).toHaveAttribute('aria-checked', 'false');

    fireEvent.click(toggle);

    expect(screen.getByText('첫 번째 추천 공고')).toBeInTheDocument();
  });

  it('관심 없음 범위를 설정하면 카드를 목록에서 빼고 해제 목록에 넣는다', () => {
    render(<RecommendationList initialRecommendations={RECOMMENDATIONS} status="success" />);

    fireEvent.click(screen.getAllByRole('button', { name: '관심 없음' })[0]);

    const scopeDialog = screen.getByRole('dialog');
    expect(within(scopeDialog).getByRole('radio', { name: /이 공고만/ })).toBeInTheDocument();
    fireEvent.click(within(scopeDialog).getByRole('radio', { name: /이 공고만/ }));
    fireEvent.click(within(scopeDialog).getByRole('button', { name: '설정' }));

    expect(screen.queryByText('첫 번째 추천 공고')).not.toBeInTheDocument();
    expect(screen.getByText('오늘의 맞춤 추천')).toHaveTextContent('1개');

    fireEvent.click(screen.getByRole('button', { name: '관심 없음 설정' }));

    const manageDialog = screen.getByRole('dialog');
    expect(within(manageDialog).getByText('첫 번째 추천 공고')).toBeInTheDocument();
    expect(within(manageDialog).getByText('테스트 기업 1 · 이 공고만')).toBeInTheDocument();
  });

  it('관심 없음 설정에 실패하면 목록을 유지하고 오류를 알린다', () => {
    render(
      <RecommendationList
        initialRecommendations={RECOMMENDATIONS}
        mockUninterestedResult="error"
        status="success"
      />,
    );

    fireEvent.click(screen.getAllByRole('button', { name: '관심 없음' })[0]);
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: '설정' }));

    expect(screen.getByRole('alert')).toHaveTextContent(
      '관심 없음 설정을 변경할 수 없습니다. 잠시 후 다시 시도해 주세요.',
    );
    expect(screen.getByText('오늘의 맞춤 추천')).toHaveTextContent('2개');

    fireEvent.click(screen.getByRole('button', { name: '오류 안내 닫기' }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('해제 모달에서 설정을 해제하고, 비어 있으면 안내를 보여준다', () => {
    render(
      <RecommendationList
        initialRecommendations={RECOMMENDATIONS}
        initialUninterestedJobs={UNINTERESTED_JOBS}
        status="success"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '관심 없음 설정' }));

    const manageDialog = screen.getByRole('dialog');
    expect(within(manageDialog).getByText('테스트 기업 3 · 비슷한 공고도')).toBeInTheDocument();

    fireEvent.click(within(manageDialog).getByRole('button', { name: '해제' }));

    expect(screen.getByText('현재 관심 없음으로 설정된 공고가 없습니다.')).toBeInTheDocument();
  });

  it('해제에 실패하면 항목을 유지하고 오류를 알린다', () => {
    render(
      <RecommendationList
        initialRecommendations={RECOMMENDATIONS}
        initialUninterestedJobs={UNINTERESTED_JOBS}
        mockUninterestedResult="error"
        status="success"
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: '관심 없음 설정' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: '해제' }));

    expect(screen.getByRole('alert')).toHaveTextContent('관심 없음 설정을 변경할 수 없습니다.');
    expect(screen.getByText('세 번째 추천 공고')).toBeInTheDocument();
  });

  it('로딩 · 오류 · 결과 없음 · 생성 중 상태를 안내한다', () => {
    const { rerender } = render(
      <RecommendationList initialRecommendations={[]} status="loading" />,
    );
    expect(screen.getByRole('status', { name: '맞춤 추천을 불러오는 중' })).toBeInTheDocument();

    rerender(<RecommendationList initialRecommendations={[]} status="error" />);
    expect(screen.getByRole('alert')).toHaveTextContent('추천 생성에 실패했어요.');
    expect(screen.getByRole('button', { name: '다시 시도' })).toBeInTheDocument();

    rerender(<RecommendationList initialRecommendations={[]} status="empty" />);
    expect(screen.getByText('현재 프로필에 맞는 공고가 없습니다.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '프로필 수정하기' })).toHaveAttribute(
      'href',
      '/profile',
    );

    rerender(<RecommendationList initialRecommendations={[]} status="generating" />);
    expect(screen.getByText('추천을 생성하고 있습니다.')).toBeInTheDocument();
  });
});
