import { api, type ApiResponse } from '@/shared/api';

import type {
  MajorMetadata,
  TechStackMetadata,
  UpdateMyProfileRequest,
} from '../model/profileSetup';

interface MajorMetadataResponse {
  items: MajorMetadata[];
}

interface TechStackMetadataResponse {
  items: TechStackMetadata[];
}

export async function fetchMajorMetadata(signal?: AbortSignal): Promise<MajorMetadata[]> {
  const { data } = await api.get<ApiResponse<MajorMetadataResponse>>('/api/v1/metadata/majors', {
    params: { activeOnly: true },
    signal,
  });
  return data.data.items;
}

export async function fetchTechStackMetadata(signal?: AbortSignal): Promise<TechStackMetadata[]> {
  const { data } = await api.get<ApiResponse<TechStackMetadataResponse>>(
    '/api/v1/metadata/tech-stacks',
    { signal },
  );
  return data.data.items;
}

export async function replaceMyMajors(majorIds: number[]): Promise<void> {
  await api.patch('/api/v1/me/majors', { majorIds });
}

export async function replaceMyTechStacks(techStackIds: number[]): Promise<void> {
  await api.patch('/api/v1/me/tech-stacks', { techStackIds });
}

export async function updateMyProfile(request: UpdateMyProfileRequest): Promise<void> {
  await api.patch('/api/v1/me/profile', request);
}
