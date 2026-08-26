import type { DepartmentCode } from '@/entities/member';

export interface CompleteProfileRequest {
  department: DepartmentCode;
  desiredJob: string;
  majorIds: number[];
  phone: string | null;
  profileImageFileId: number;
  techStackIds: number[];
}
