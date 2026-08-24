import { api, type ApiResponse } from '@/shared/api';

import type {
  CreateInquiryApiResponse,
  CreateInquiryRequest,
  FetchMyInquiryListParams,
  InquiryDetailApiResponse,
  InquiryListApiResponse,
} from '../model/types';

const INQUIRY_PATH = '/api/v1/inquiries';
const MY_INQUIRY_PATH = '/api/v1/me/inquiries';

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
