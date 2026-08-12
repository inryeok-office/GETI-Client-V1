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
  cohort: number;
  department: string;
  introduction: string;
  links: string[];
  name: string;
  skills: string[];
}

export const MOCK_MY_PROFILE_FORM: MyProfileFormData = {
  introduction: '',
  isProfilePublic: true,
  isRecommendationEnabled: true,
  links: [''],
  major: '디자인',
  phone: '',
  skills: ['Figma'],
};

export const MOCK_MY_PROFILE_PREVIEW: MyProfilePreviewData = {
  cohort: 9,
  department: '소프트웨어개발과',
  introduction:
    '사용자 경험을 고려한 프론트엔드 개발에 관심이 있습니다. React와 TypeScript를 활용한 프로젝트 경험을 쌓고 있습니다.',
  links: ['github.com/test', 'test.dev'],
  name: '이름',
  skills: ['React', 'TypeScript', 'JavaScript', 'Figma', 'Git'],
};

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
