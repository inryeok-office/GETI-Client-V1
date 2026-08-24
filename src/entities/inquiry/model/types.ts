export type InquiryStatus = 'RECEIVED' | 'IN_PROGRESS' | 'ANSWERED' | 'CLOSED';

export type InquiryType = 'ERROR' | 'INCONVENIENCE' | 'FEATURE_REQUEST' | 'ETC';

export interface InquiryAssignee {
  memberId: string;
  name: string;
}

export interface AdminInquiryListItem {
  answeredAt: string | null;
  assignee: InquiryAssignee | null;
  author: {
    memberId: string;
    name: string;
  };
  createdAt: string;
  inquiryId: string;
  inquiryType: InquiryType;
  status: InquiryStatus;
  title: string;
}

export interface AdminInquiryDetail extends InquiryDetail {
  assignee: InquiryAssignee | null;
  author: {
    memberId: string;
    name: string;
    profileImageUrl: string | null;
    cohort: number | null;
    department: string | null;
    isPublic: boolean;
  };
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

export interface AdminInquiryListApiItem {
  inquiryId: number;
  inquiryType: InquiryType;
  title: string;
  status: InquiryStatus;
  author: {
    memberId: number;
    name: string | null;
  };
  assignee: {
    memberId: number;
    name: string;
  } | null;
  createdAt: string;
  answeredAt: string | null;
}

export interface AdminInquiryListApiResponse {
  content: AdminInquiryListApiItem[];
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

export interface FetchAdminInquiryListParams {
  inquiryType?: InquiryType;
  status?: InquiryStatus;
  query?: string;
  assigneeId?: number;
  mineOnly?: boolean;
  page?: number;
  size?: number;
}

export interface UpdateAdminInquiryStatusVariables {
  inquiryId: number;
  status: InquiryStatus;
}

export interface UpdateAdminInquiryStatusApiResponse {
  inquiryId: number;
  status: InquiryStatus;
  updatedAt: string;
}

export interface CreateAdminInquiryAnswerVariables {
  inquiryId: number;
  content: string;
  fileIds?: number[];
}

export interface CreateAdminInquiryAnswerApiResponse {
  answerId: number;
  inquiryId: number;
  authorMemberId: number;
  content: string;
  files: InquiryFileApiResponse[];
  createdAt: string;
  inquiryStatus: InquiryStatus;
  notificationCreated: boolean;
}
