export { InquiryCard } from './ui/InquiryCard';
export { InquiryDetailContent } from './ui/InquiryDetailContent';
export { InquiryStatusBadge } from './ui/InquiryStatusBadge';
export { InquirySummaryCard } from './ui/InquirySummaryCard';
export {
  inquiryKeys,
  useCreateInquiryMutation,
  useInquiryDetailQuery,
  useMyInquiryListQuery,
} from './api/useInquiryQueries';
export { mapInquiryDetail, mapInquiryListItem } from './model/mapInquiry';
export type {
  AdminInquiryTypeLabel,
  AdminInquiryListItem,
  CreateInquiryRequest,
  FetchMyInquiryListParams,
  InquiryAnswer,
  InquiryAuthor,
  InquiryDetail,
  InquiryDetailApiResponse,
  InquiryFile,
  InquiryListItem,
  InquiryListApiResponse,
  InquiryStatus,
  InquiryType,
} from './model/types';
