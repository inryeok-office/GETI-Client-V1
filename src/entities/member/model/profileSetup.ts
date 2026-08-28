export type DepartmentCode = 'AI' | 'SMART_IOT' | 'SW_DEVELOPMENT';

export interface MajorMetadata {
  majorId: number;
  name: string;
  active: boolean;
}

export type TechStackCategory =
  'AI' | 'BACKEND' | 'DATABASE' | 'DEVOPS' | 'ETC' | 'FRONTEND' | 'MOBILE';

export interface TechStackMetadata {
  techStackId: number;
  name: string;
  category: TechStackCategory;
}

export interface UpdateMyProfileLinkRequest {
  label: string;
  url: string;
}

export interface UpdateMyProfileRequest {
  bio?: string | null;
  cohort?: number | null;
  department?: DepartmentCode | null;
  desiredJob?: string | null;
  githubUrl?: string | null;
  isPublic?: boolean;
  links?: UpdateMyProfileLinkRequest[];
  phone?: string | null;
  profileImageFileId?: number | null;
}
