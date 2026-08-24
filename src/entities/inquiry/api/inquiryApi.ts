import { api, type ApiResponse } from '@/shared/api';

import type {
  AdminInquiryListApiResponse,
  CreateAdminInquiryAnswerApiResponse,
  CreateAdminInquiryAnswerVariables,
  CreateInquiryApiResponse,
  CreateInquiryRequest,
  FetchAdminInquiryListParams,
  FetchMyInquiryListParams,
  InquiryDetailApiResponse,
  InquiryListApiResponse,
  UpdateAdminInquiryStatusApiResponse,
  UpdateAdminInquiryStatusVariables,
} from '../model/types';

const INQUIRY_PATH = '/api/v1/inquiries';
const MY_INQUIRY_PATH = '/api/v1/me/inquiries';
const ADMIN_INQUIRY_PATH = '/api/v1/admin/inquiries';

/** 요청자 본인의 문의 목록을 조회한다. */
export async function fetchMyInquiryList(
  params: FetchMyInquiryListParams = {},
): Promise<InquiryListApiResponse> {
  const { data } = await api.get<ApiResponse<InquiryListApiResponse>>(MY_INQUIRY_PATH, {
    params: { page: 0, size: 20, ...params },
  });
  return data.data;
}

/** 문의 소유권은 서버가 검사하며 학생·교사는 본인이 작성한 문의만 조회할 수 있다. */
export async function fetchInquiryDetail(inquiryId: number): Promise<InquiryDetailApiResponse> {
  const { data } = await api.get<ApiResponse<InquiryDetailApiResponse>>(
    `${INQUIRY_PATH}/${inquiryId}`,
  );
  return data.data;
}

/** 새 문의를 등록한다. Discord 전달 결과를 기다리지 않고 생성 결과를 반환한다. */
export async function createInquiry(
  request: CreateInquiryRequest,
): Promise<CreateInquiryApiResponse> {
  const { data } = await api.post<ApiResponse<CreateInquiryApiResponse>>(INQUIRY_PATH, request);
  return data.data;
}

/** 개발자가 전체 문의를 최신 등록순으로 조회하고 서버에서 검색·필터링한다. */
export async function fetchAdminInquiryList(
  params: FetchAdminInquiryListParams = {},
): Promise<AdminInquiryListApiResponse> {
  const { data } = await api.get<ApiResponse<AdminInquiryListApiResponse>>(ADMIN_INQUIRY_PATH, {
    params: { page: 0, size: 20, mineOnly: false, ...params },
  });
  return data.data;
}

/** 개발자가 문의 상태를 서버가 허용하는 다음 상태로 변경한다. */
export async function updateAdminInquiryStatus({
  inquiryId,
  status,
}: UpdateAdminInquiryStatusVariables): Promise<UpdateAdminInquiryStatusApiResponse> {
  const { data } = await api.patch<ApiResponse<UpdateAdminInquiryStatusApiResponse>>(
    `${ADMIN_INQUIRY_PATH}/${inquiryId}/status`,
    { status },
  );
  return data.data;
}

/** 개발자가 문의 답변을 등록한다. 성공하면 서버가 문의 상태를 ANSWERED로 변경한다. */
export async function createAdminInquiryAnswer({
  inquiryId,
  content,
  fileIds,
}: CreateAdminInquiryAnswerVariables): Promise<CreateAdminInquiryAnswerApiResponse> {
  const { data } = await api.post<ApiResponse<CreateAdminInquiryAnswerApiResponse>>(
    `${ADMIN_INQUIRY_PATH}/${inquiryId}/answers`,
    { content, fileIds },
  );
  return data.data;
}

/** 문의 첨부파일을 권한 검증 Endpoint를 거쳐 Binary로 내려받는다. */
export async function downloadInquiryFile(fileId: number): Promise<Blob> {
  const response = await api.get<Blob>(`/api/v1/files/${fileId}/download`, {
    responseType: 'blob',
  });
  return response.data;
}
