import { uploadCommonFile, type CommonFileUploadResponse } from '@/entities/common-file';
import { replaceMyMajors, replaceMyTechStacks, updateMyProfile } from '@/entities/member';
import { fetchSession, type Session } from '@/entities/session';

import type { CompleteProfileRequest } from '../model/types';

export function uploadProfileImage(file: File): Promise<CommonFileUploadResponse> {
  return uploadCommonFile(file, 'PROFILE_IMAGE');
}

/** 프로필 본문은 전공·기술 스택이 저장된 뒤 마지막에 갱신해 재시도를 안전하게 만든다. */
export async function completeProfile(request: CompleteProfileRequest): Promise<Session> {
  await replaceMyMajors(request.majorIds);
  await replaceMyTechStacks(request.techStackIds);
  await updateMyProfile({
    department: request.department,
    desiredJob: request.desiredJob,
    phone: request.phone,
    profileImageFileId: request.profileImageFileId,
  });

  return fetchSession();
}
