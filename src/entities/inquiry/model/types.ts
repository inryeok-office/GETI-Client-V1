export type InquiryStatus = 'RECEIVED' | 'IN_PROGRESS' | 'ANSWERED' | 'CLOSED';

export type InquiryType = 'ERROR' | 'INCONVENIENCE' | 'FEATURE_REQUEST' | 'ETC';

export type AdminInquiryTypeLabel = '서비스 이용' | '지원 문의' | '계정, 프로필' | '공고 문의';

export interface InquiryAuthor {
  cohort: number;
  department: string;
  name: string;
  studentNumber: string;
}

export interface AdminInquiryListItem {
  answer: string | null;
  answeredAt: string | null;
  author: InquiryAuthor;
  content: string;
  createdAt: string;
  inquiryId: string;
  inquiryTypeLabel: AdminInquiryTypeLabel;
  status: InquiryStatus;
  title: string;
}

export interface InquiryListItem {
  inquiryId: string;
  title: string;
  status: InquiryStatus;
  createdAt: string;
}

export interface InquiryAnswer {
  content: string;
  createdAt: string;
}

export interface InquiryDetail extends InquiryListItem {
  content: string;
  answer: InquiryAnswer | null;
}
