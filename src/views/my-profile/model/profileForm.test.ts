import { describe, expect, it } from 'vitest';

import type { MyProfile } from '@/entities/member';

import { mapMyProfileToForm, mapMyProfileToPreview } from './profileForm';

const MAJORS = [
  { active: true, majorId: 1, name: '백엔드' },
  { active: true, majorId: 2, name: '프론트엔드' },
];
const TECH_STACKS = [
  { category: 'FRONTEND' as const, name: 'React', techStackId: 10 },
  { category: 'FRONTEND' as const, name: 'TypeScript', techStackId: 11 },
];

const PROFILE: MyProfile = {
  academicStatus: 'ENROLLED',
  bio: '프론트엔드 개발자입니다.',
  cohort: 9,
  department: 'SW_DEVELOPMENT',
  desiredJob: 'Frontend Developer',
  email: 'student@example.com',
  githubUrl: null,
  isPublic: true,
  links: [{ label: '블로그', url: 'https://blog.example.com' }],
  majors: ['프론트엔드'],
  memberId: 1,
  name: '김게티',
  phone: '010-1234-5678',
  profileImageUrl: 'https://cdn.example.com/profile.png',
  roles: ['STUDENT'],
  status: 'ACTIVE',
  techStacks: ['React', 'TypeScript'],
};

describe('profileForm', () => {
  it('조회한 프로필로 편집 폼을 초기화한다', () => {
    expect(mapMyProfileToForm(PROFILE, MAJORS, TECH_STACKS)).toEqual({
      introduction: '프론트엔드 개발자입니다.',
      isProfilePublic: true,
      links: ['https://blog.example.com'],
      majorId: 2,
      majorName: '프론트엔드',
      phone: '010-1234-5678',
      techStackIds: [10, 11],
    });
  });

  it('조회한 프로필로 공개 미리보기를 초기화한다', () => {
    expect(mapMyProfileToPreview(PROFILE)).toEqual({
      cohort: 9,
      department: '소프트웨어개발과',
      introduction: '프론트엔드 개발자입니다.',
      links: ['https://blog.example.com'],
      major: '프론트엔드',
      name: '김게티',
      profileImageUrl: 'https://cdn.example.com/profile.png',
      skills: ['React', 'TypeScript'],
    });
  });

  it('선택 정보가 없으면 빈 입력값으로 초기화한다', () => {
    expect(
      mapMyProfileToForm(
        {
          ...PROFILE,
          bio: null,
          links: [],
          majors: [],
          phone: null,
          techStacks: [],
        },
        MAJORS,
        TECH_STACKS,
      ),
    ).toMatchObject({
      introduction: '',
      links: [''],
      majorId: null,
      majorName: '',
      phone: '',
      techStackIds: [],
    });
  });

  it('공개 항목이 없으면 빈 미리보기 값으로 변환한다', () => {
    expect(
      mapMyProfileToPreview({
        ...PROFILE,
        bio: null,
        links: [],
        majors: [],
        techStacks: [],
      }),
    ).toMatchObject({
      introduction: '',
      links: [],
      major: '',
      skills: [],
    });
  });

  it('비활성 전공처럼 메타데이터에 없는 현재 전공 이름은 표시용으로 보존한다', () => {
    expect(
      mapMyProfileToForm({ ...PROFILE, majors: ['이전 전공'] }, MAJORS, TECH_STACKS),
    ).toMatchObject({
      majorId: null,
      majorName: '이전 전공',
    });
  });
});
