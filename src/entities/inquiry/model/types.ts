export type InquiryStatus = 'RECEIVED' | 'IN_PROGRESS' | 'ANSWERED' | 'CLOSED';

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
