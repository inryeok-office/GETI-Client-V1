export { InquiryCard } from './ui/InquiryCard';
export { InquiryDetailContent } from './ui/InquiryDetailContent';
export { InquiryStatusBadge } from './ui/InquiryStatusBadge';
export { InquirySummaryCard } from './ui/InquirySummaryCard';
export {
  inquiryKeys,
  useAdminInquiryListQuery,
  useCreateAdminInquiryAnswerMutation,
  useCreateInquiryMutation,
  useDownloadInquiryFileMutation,
  useInquiryDetailQuery,
  useMyInquiryListQuery,
  useUpdateAdminInquiryStatusMutation,
} from './api/useInquiryQueries';
export {
  mapAdminInquiryDetail,
  mapAdminInquiryListItem,
  mapInquiryDetail,
  mapInquiryListItem,
} from './model/mapInquiry';
export type {
  AdminInquiryDetail,
  AdminInquiryListItem,
  CreateAdminInquiryAnswerVariables,
  CreateInquiryRequest,
  FetchAdminInquiryListParams,
  FetchMyInquiryListParams,
  InquiryAnswer,
  InquiryAssignee,
  InquiryDetail,
  InquiryDetailApiResponse,
  InquiryFile,
  InquiryListItem,
  InquiryListApiResponse,
  InquiryStatus,
  InquiryType,
  UpdateAdminInquiryStatusVariables,
} from './model/types';
