/** 적합도 배지 문구를 결정한다. 추천(적합) · 부적합 두 가지다. */
export type RecommendationFit = 'FIT' | 'UNFIT';

/** 관심 없음 적용 범위. "비슷한 공고도"는 서버 정책 미확정(TBD)이다. */
export type UninterestedScope = 'SIMILAR_JOBS' | 'THIS_JOB';

/** 맞춤 추천 목록의 한 줄. 공고 정보 + 추천 근거를 함께 가진다. */
export interface RecommendationItem {
  recommendationId: string;
  companyName: string;
  title: string;
  fit: RecommendationFit;
  /** 제목 아래 칩(예: "인턴", "외부 지원"). */
  tags: string[];
  /** 칩 옆 보조 문구(예: "웹 프론트엔드 · 판교"). */
  subLabel: string;
  /** 추천 근거 문장. 한 줄에 하나씩 보여준다. */
  reasons: string[];
  /** 우측 상단 마감 문구(예: "마감 D-5"). */
  deadlineLabel: string;
  detailHref: string;
}

/** 관심 없음으로 설정된 공고. 해제 모달의 목록에 쓰인다. */
export interface UninterestedJob {
  uninterestedId: string;
  title: string;
  companyName: string;
  scope: UninterestedScope;
}

/** 관심 없음 범위 문구. 해제 목록의 보조 설명에도 같은 문구를 쓴다. */
export const UNINTERESTED_SCOPE_LABELS: Record<UninterestedScope, string> = {
  THIS_JOB: '이 공고만',
  SIMILAR_JOBS: '비슷한 공고도',
};
