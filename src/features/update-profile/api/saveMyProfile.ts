import {
  fetchMyProfile,
  replaceMyMajors,
  replaceMyTechStacks,
  updateMyProfile,
  type MyProfile,
} from '@/entities/member';

import type { SaveMyProfileRequest } from '../model/types';

export async function saveMyProfile(request: SaveMyProfileRequest): Promise<MyProfile> {
  if (request.majorIds) {
    await replaceMyMajors(request.majorIds);
  }

  if (request.techStackIds) {
    await replaceMyTechStacks(request.techStackIds);
  }

  await updateMyProfile(request.profile);
  return fetchMyProfile();
}
