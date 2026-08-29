import type {
  MajorMetadata,
  MyProfile,
  TechStackMetadata,
  UpdateMyProfileLinkRequest,
} from '@/entities/member';

export interface MyProfileFormLink {
  label: string;
  url: string;
}

export interface MyProfileFormData {
  introduction: string;
  isProfilePublic: boolean;
  links: MyProfileFormLink[];
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
  major: string;
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
    links: profile.links.length > 0 ? profile.links : [{ label: '', url: '' }],
    majorId,
    majorName,
    phone: profile.phone ?? '',
    techStackIds: techStacks
      .filter((techStack) => selectedTechStackNames.has(techStack.name))
      .map((techStack) => techStack.techStackId),
  };
}

export function buildProfileLinkRequests(links: MyProfileFormLink[]): UpdateMyProfileLinkRequest[] {
  return links
    .map((link) => ({ label: link.label.trim(), url: link.url.trim() }))
    .filter((link) => link.url)
    .map((link, index) => {
      let parsedUrl: URL;

      try {
        parsedUrl = new URL(link.url);
      } catch {
        throw new Error(`${index + 1}번째 URL 형식을 확인해 주세요.`);
      }

      if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
        throw new Error(`${index + 1}번째 URL은 http 또는 https 주소만 사용할 수 있습니다.`);
      }

      return {
        label: (link.label || parsedUrl.hostname || `링크 ${index + 1}`).slice(0, 100),
        url: link.url,
      };
    });
}

export function mapMyProfileToPreview(profile: MyProfile): MyProfilePreviewData {
  return {
    cohort: profile.cohort,
    department: profile.department ? DEPARTMENT_LABEL[profile.department] : '학과 미등록',
    introduction: profile.bio ?? '',
    links: profile.links.map((link) => link.url),
    major: profile.majors[0] ?? '',
    name: profile.name,
    profileImageUrl: profile.profileImageUrl,
    skills: profile.techStacks,
  };
}
