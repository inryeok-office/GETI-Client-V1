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
  inquiryType: InquiryType;
  title: string;
  status: InquiryStatus;
  createdAt: string;
}

export interface InquiryFile {
  fileId: string;
  originalName: string;
  contentType: string;
  size: number;
  downloadUrl: string | null;
}

export interface InquiryAnswer {
  answerId: string;
  content: string;
  createdAt: string;
  files: InquiryFile[];
}

export interface InquiryDetail extends InquiryListItem {
  content: string;
  answers: InquiryAnswer[];
  files: InquiryFile[];
}

export interface InquiryAuthorApiResponse {
  memberId: number;
  name: string | null;
  profileImageUrl: string | null;
  cohort: number | null;
  department: string | null;
  isPublic: boolean;
}

export interface InquiryFileApiResponse {
  fileId: number;
  originalName: string;
  contentType: string;
  size: number;
  downloadUrl: string | null;
}

export interface InquiryAnswerApiResponse {
  answerId: number;
  inquiryId: number;
  authorMemberId: number;
  content: string;
  files: InquiryFileApiResponse[];
  createdAt: string;
}

export interface InquiryListApiItem {
  inquiryId: number;
  inquiryType: InquiryType;
  title: string;
  status: InquiryStatus;
  createdAt: string;
  answeredAt: string | null;
}

export interface InquiryListApiResponse {
  content: InquiryListApiItem[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface InquiryDetailApiResponse {
  inquiryId: number;
  inquiryType: InquiryType;
  title: string;
  content: string;
  status: InquiryStatus;
  author: InquiryAuthorApiResponse;
  files: InquiryFileApiResponse[];
  assignee: { memberId: number; name: string } | null;
  answers: InquiryAnswerApiResponse[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateInquiryRequest {
  inquiryType: InquiryType;
  title: string;
  content: string;
  fileIds?: number[];
}

export type CreateInquiryApiResponse = Omit<InquiryDetailApiResponse, 'assignee'>;

export interface FetchMyInquiryListParams {
  status?: InquiryStatus;
  page?: number;
  size?: number;
}
