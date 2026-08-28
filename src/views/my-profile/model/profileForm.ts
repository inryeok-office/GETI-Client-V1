import type { MajorMetadata, MyProfile, TechStackMetadata } from '@/entities/member';

export interface MyProfileFormData {
  introduction: string;
  isProfilePublic: boolean;
  links: string[];
  majorId: number | null;
  majorName: string;
  phone: string;
  techStackIds: number[];
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

export function mapMyProfileToForm(
  profile: MyProfile,
  majors: MajorMetadata[],
  techStacks: TechStackMetadata[],
): MyProfileFormData {
  const majorName = profile.majors[0] ?? '';
  const majorId = majors.find((major) => major.name === majorName)?.majorId ?? null;
  const selectedTechStackNames = new Set(profile.techStacks);

  return {
    introduction: profile.bio ?? '',
    isProfilePublic: profile.isPublic,
    links: profile.links.length > 0 ? profile.links.map((link) => link.url) : [''],
    majorId,
    majorName,
    phone: profile.phone ?? '',
    techStackIds: techStacks
      .filter((techStack) => selectedTechStackNames.has(techStack.name))
      .map((techStack) => techStack.techStackId),
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
