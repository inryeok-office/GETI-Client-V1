import type { MyProfile } from '@/entities/member';

export interface MyProfileFormData {
  introduction: string;
  isProfilePublic: boolean;
  isRecommendationEnabled: boolean;
  links: string[];
  major: string;
  phone: string;
  skills: string[];
}

export interface MyProfilePreviewData {
  cohort: number | null;
  department: string;
  introduction: string;
  links: string[];
  name: string;
  profileImageUrl: string | null;
  skills: string[];
}

const DEPARTMENT_LABEL: Record<NonNullable<MyProfile['department']>, string> = {
  AI: 'AI과',
  SMART_IOT: '스마트IoT과',
  SW_DEVELOPMENT: '소프트웨어개발과',
};

export function mapMyProfileToForm(profile: MyProfile): MyProfileFormData {
  return {
    introduction: profile.bio ?? '',
    isProfilePublic: profile.isPublic,
    isRecommendationEnabled: false,
    links: profile.links.length > 0 ? profile.links.map((link) => link.url) : [''],
    major: profile.majors[0] ?? '',
    phone: profile.phone ?? '',
    skills: profile.techStacks,
  };
}

export function mapMyProfileToPreview(profile: MyProfile): MyProfilePreviewData {
  return {
    cohort: profile.cohort,
    department: profile.department ? DEPARTMENT_LABEL[profile.department] : '학과 미등록',
    introduction: profile.bio ?? '',
    links: profile.links.map((link) => link.url),
    name: profile.name,
    profileImageUrl: profile.profileImageUrl,
    skills: profile.techStacks,
  };
}

export const MY_PROFILE_MAJORS = [
  '백엔드',
  '프론트엔드',
  '디자인',
  '플러터',
  'AI',
  'IoT',
  'DevOps',
  'iOS',
  '기능반',
  '기타',
] as const;
