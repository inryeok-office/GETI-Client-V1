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

export interface UpdateMyProfileRequest {
  department: DepartmentCode;
  desiredJob: string;
  phone: string | null;
  profileImageFileId: number;
}
