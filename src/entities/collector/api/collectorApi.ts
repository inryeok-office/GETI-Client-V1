import { api, type ApiResponse } from '@/shared/api';

import type {
  CollectorActionApiResponse,
  CollectorRunApiDetail,
  CollectorRunListApiResponse,
  ExecuteCollectorActionParams,
  FetchCollectorRunListParams,
  JobSourceListApiResponse,
  JobSourceUpdateApiResponse,
  UpdateJobSourceParams,
} from '../model/types';

const ADMIN_COLLECTION_RUN_PATH = '/api/v1/admin/collection-runs';
const ADMIN_JOB_SOURCE_PATH = '/api/v1/admin/job-sources';
const ADMIN_COLLECTOR_ACTION_PATH = '/api/v1/admin/collector-actions';

export async function fetchAdminJobSources(): Promise<JobSourceListApiResponse> {
  const { data } = await api.get<ApiResponse<JobSourceListApiResponse>>(ADMIN_JOB_SOURCE_PATH);
  return data.data;
}

export async function updateAdminJobSource({
  enabled,
  sourceId,
}: UpdateJobSourceParams): Promise<JobSourceUpdateApiResponse> {
  const { data } = await api.patch<ApiResponse<JobSourceUpdateApiResponse>>(
    `${ADMIN_JOB_SOURCE_PATH}/${sourceId}`,
    { enabled },
  );
  return data.data;
}

export async function executeAdminCollectorAction(
  request: ExecuteCollectorActionParams,
): Promise<CollectorActionApiResponse> {
  const { data } = await api.post<ApiResponse<CollectorActionApiResponse>>(
    ADMIN_COLLECTOR_ACTION_PATH,
    request,
  );
  return data.data;
}

export async function fetchAdminCollectorRunList(
  params: FetchCollectorRunListParams = {},
): Promise<CollectorRunListApiResponse> {
  const { data } = await api.get<ApiResponse<CollectorRunListApiResponse>>(
    ADMIN_COLLECTION_RUN_PATH,
    { params: { page: 0, size: 5, ...params } },
  );
  return data.data;
}

export async function fetchAdminCollectorRunDetail(runId: number): Promise<CollectorRunApiDetail> {
  const { data } = await api.get<ApiResponse<CollectorRunApiDetail>>(
    `${ADMIN_COLLECTION_RUN_PATH}/${runId}`,
  );
  return data.data;
}
