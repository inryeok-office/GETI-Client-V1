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

/** 어드민 기업 관리 목록의 기업 유형. 학생용 `CompanySize`보다 세분화되어 별도 타입으로 둔다. */
export type AdminCompanyType = 'large' | 'midsize' | 'small' | 'startup';

/** 기업 정보 출처. */
export type CompanyInfoSource = 'direct' | 'external';

/** MOU 체결 상태. */
export type MouStatus = 'expired' | 'signed' | 'unsigned';

/** 어드민 기업 관리 목록 행에 필요한 정보. */
export interface AdminCompanyListItem {
  id: string;
  name: string;
  type: AdminCompanyType;
  infoSource: CompanyInfoSource;
  mouStatus: MouStatus;
  /** MOU 체결 기간(예: "2025.03.01 – 2027.02.28"). 미체결 · 만료면 null. */
  mouPeriod: string | null;
  /** 기업 활성/비활성 상태 문구(예: "정상"). */
  statusLabel: string;
  /** "수정" 클릭 시 이동할 어드민 기업 상세 페이지 경로. */
  detailHref: string;
}
