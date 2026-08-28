import { describe, expect, it } from 'vitest';

import type { MyProfile } from '@/entities/member';

import { mapMyProfileToForm, mapMyProfileToPreview } from './profileForm';

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
    expect(mapMyProfileToForm(PROFILE)).toEqual({
      introduction: '프론트엔드 개발자입니다.',
      isProfilePublic: true,
      isRecommendationEnabled: false,
      links: ['https://blog.example.com'],
      major: '프론트엔드',
      phone: '010-1234-5678',
      skills: ['React', 'TypeScript'],
    });
  });

  it('조회한 프로필로 공개 미리보기를 초기화한다', () => {
    expect(mapMyProfileToPreview(PROFILE)).toEqual({
      cohort: 9,
      department: '소프트웨어개발과',
      introduction: '프론트엔드 개발자입니다.',
      links: ['https://blog.example.com'],
      name: '김게티',
      profileImageUrl: 'https://cdn.example.com/profile.png',
      skills: ['React', 'TypeScript'],
    });
  });

  it('선택 정보가 없으면 빈 입력값으로 초기화한다', () => {
    expect(
      mapMyProfileToForm({
        ...PROFILE,
        bio: null,
        links: [],
        majors: [],
        phone: null,
        techStacks: [],
      }),
    ).toMatchObject({
      introduction: '',
      links: [''],
      major: '',
      phone: '',
      skills: [],
    });
  });
});
