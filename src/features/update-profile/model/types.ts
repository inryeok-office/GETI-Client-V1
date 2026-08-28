import type { UpdateMyProfileRequest } from '@/entities/member';

export interface SaveMyProfileRequest {
  majorIds?: number[];
  profile: UpdateMyProfileRequest;
  techStackIds?: number[];
}
