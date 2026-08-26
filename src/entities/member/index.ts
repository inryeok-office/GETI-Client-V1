export {
  MEMBER_ACCOUNT_LABELS,
  MEMBER_AFFILIATION_LABELS,
  MEMBER_ROLE_LABELS,
  type ManagedMember,
  type MemberAccountStatus,
  type MemberAffiliationStatus,
  type MemberRole,
} from './model/types';
export type { MyProfile } from './model/myProfile';
export type {
  DepartmentCode,
  MajorMetadata,
  TechStackCategory,
  TechStackMetadata,
  UpdateMyProfileRequest,
} from './model/profileSetup';
export {
  fetchMajorMetadata,
  fetchTechStackMetadata,
  replaceMyMajors,
  replaceMyTechStacks,
  updateMyProfile,
} from './api/profileSetupApi';
export { memberKeys, useMyProfileQuery } from './api/useMyProfileQuery';
export { useMajorMetadataQuery, useTechStackMetadataQuery } from './api/useProfileSetupQueries';
