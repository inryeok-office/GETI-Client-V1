/** 기업 규모 구분. 카드의 규모 배지 문구를 결정한다. */
export type CompanySize = 'large' | 'midsize' | 'small';

/** 기업 목록 카드에 필요한 최소 정보. */
export interface CompanyListItem {
  id: string;
  name: string;
  /** 학교 MOU 체결 기업 여부. true면 "MOU 기업" 배지가 붙는다. */
  isMou: boolean;
  size: CompanySize;
  /** 채용 중인 공고 수. */
  openJobCount: number;
  /** 카드 클릭 시 이동할 기업 상세 페이지 경로. */
  detailHref: string;
}

/** 기업 상세 화면에 필요한 정보. */
export interface CompanyDetail {
  id: string;
  name: string;
  /** 학교 MOU 체결 기업 여부. true면 "MOU 기업" 배지가 붙는다. */
  isMou: boolean;
  size: CompanySize;
  /** 업종(예: "IT 서비스"). */
  industry: string;
  address: string;
  introduction: string;
  /** 기업 홈페이지 URL. */
  homepageUrl: string;
  /** 비공개 · 삭제 등으로 접근할 수 없는 경우의 사유. 정상 조회는 null. */
  unavailableReason: '비공개' | '삭제' | null;
}
