export type BookmarkCompanyType =
  'GENERAL' | 'PUBLIC_ENTERPRISE' | 'PUBLIC_INSTITUTION' | 'FOREIGN' | 'ETC';

export type BookmarkJobPostingType = 'GENERAL' | 'MOU' | 'SCHOOL';
export type BookmarkJobApplicationMethod = 'INTERNAL' | 'EXTERNAL';
export type BookmarkJobStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'DELETED';
export type BookmarkJobSort = 'LATEST' | 'DEADLINE' | 'VIEWS';

export interface BookmarkCompanySummary {
  companyId: number;
  name: string;
  logoUrl: string | null;
}

export interface BookmarkTechStack {
  techStackId: number | null;
  name: string;
}

export interface BookmarkJobSummary {
  jobId: number;
  title: string;
  postingType: BookmarkJobPostingType;
  applicationMethod: BookmarkJobApplicationMethod;
  status: BookmarkJobStatus;
  company: BookmarkCompanySummary | null;
  endDate: string | null;
  viewCount: number;
  bookmarked: boolean;
  techStacks: BookmarkTechStack[];
  bookmarkCount: number;
  location: string | null;
  employmentType: string | null;
}

export interface BookmarkListApiResponse {
  content: BookmarkJobSummary[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface FetchBookmarkListParams {
  query?: string;
  postingType?: BookmarkJobPostingType;
  companyType?: BookmarkCompanyType;
  sort?: BookmarkJobSort;
  page?: number;
  size?: number;
}

export interface CreateBookmarkRequest {
  jobId: number;
}

export type BookmarkMutationApiResponse = BookmarkJobSummary;
