'use client';

import { skipToken, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import {
  executeApplicantAction,
  exportJobApplications,
  fetchAllJobApplicants,
  fetchAllJobPostings,
  fetchApplicantDetail,
  fetchApplicantHistory,
  fetchApplicantList,
  type ExecuteApplicantActionParams,
  type ExportJobApplicationsParams,
  type FetchApplicantListParams,
} from './applicantApi';

export const applicantKeys = {
  all: ['applicants'] as const,
  list: (params: FetchApplicantListParams) => [...applicantKeys.all, 'list', params] as const,
  jobPostingOptions: () => [...applicantKeys.all, 'job-posting-options'] as const,
  jobApplicantOptions: (jobId: number) =>
    [...applicantKeys.all, 'job-applicant-options', jobId] as const,
  detail: (applicationId: number) => [...applicantKeys.all, 'detail', applicationId] as const,
  history: (applicationId: number) => [...applicantKeys.all, 'history', applicationId] as const,
};

/** `options.enabled`이 false면 아직 값을 정하지 못한 파라미터(예: 아직 안 고른 jobId)로 요청을 보내지 않는다. */
export function useApplicantListQuery(
  params: FetchApplicantListParams = {},
  options: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: applicantKeys.list(params),
    queryFn: () => fetchApplicantList(params),
    enabled: options.enabled,
  });
}

/** 다운로드 모달의 "공고" 드롭다운. 상한 없이 전체 공고를 모은다(PR #134 코드리뷰 반영). */
export function useJobPostingOptionsQuery() {
  return useQuery({
    queryKey: applicantKeys.jobPostingOptions(),
    queryFn: fetchAllJobPostings,
  });
}

/** 다운로드 모달의 "지원자" 체크박스 목록. jobId가 아직 없으면(공고 목록 로딩 중) 요청하지 않는다. */
export function useJobApplicantOptionsQuery(jobId: number | undefined) {
  return useQuery({
    queryKey: applicantKeys.jobApplicantOptions(jobId ?? -1),
    queryFn: jobId === undefined ? skipToken : () => fetchAllJobApplicants(jobId),
  });
}

/** applicationId는 호출부에서 `Number.isInteger`로 걸러진 값만 받는다(NaN 요청 방지). */
export function useApplicantDetailQuery(applicationId: number | null) {
  return useQuery({
    queryKey: applicantKeys.detail(applicationId ?? -1),
    queryFn: applicationId === null ? skipToken : () => fetchApplicantDetail(applicationId),
  });
}

/** applicationId는 호출부에서 `Number.isInteger`로 걸러진 값만 받는다(NaN 요청 방지). */
export function useApplicantHistoryQuery(applicationId: number | null) {
  return useQuery({
    queryKey: applicantKeys.history(applicationId ?? -1),
    queryFn: applicationId === null ? skipToken : () => fetchApplicantHistory(applicationId),
  });
}

/** 승인 · 거절 · 보완 요청 · 수정 허용 Action. 성공하면 목록 · 상세 · 이력을 다시 불러온다. */
export function useApplicantActionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: ExecuteApplicantActionParams) => executeApplicantAction(params),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: applicantKeys.all });
      queryClient.invalidateQueries({ queryKey: applicantKeys.detail(variables.applicationId) });
      queryClient.invalidateQueries({ queryKey: applicantKeys.history(variables.applicationId) });
    },
  });
}

/** 공고별 지원자 자료 일괄 다운로드(ZIP). 서버 상태를 바꾸지 않으니 쿼리 무효화는 하지 않는다. */
export function useExportJobApplicationsMutation() {
  return useMutation({
    mutationFn: (params: ExportJobApplicationsParams) => exportJobApplications(params),
  });
}
