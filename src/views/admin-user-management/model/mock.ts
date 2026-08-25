import type { ManagedMember } from '@/entities/member';

export const MOCK_MANAGED_MEMBERS: ManagedMember[] = [
  {
    accountStatus: 'INACTIVE',
    affiliationStatus: 'ENROLLED',
    email: 's26000@gsm.hs.kr',
    memberId: 'member-kim-min-jae',
    name: '김민재',
    roles: ['STUDENT'],
  },
  {
    accountStatus: 'ACTIVE',
    affiliationStatus: 'GRADUATED',
    email: 's26000@gmail.com',
    memberId: 'member-park-bo-gum',
    name: '박보검',
    roles: ['TEACHER'],
  },
  {
    accountStatus: 'ACTIVE',
    affiliationStatus: 'GRADUATED',
    email: 's26000@gsm.hs.kr',
    isCurrentUser: true,
    memberId: 'member-cha-eun-woo',
    name: '차은우',
    roles: ['GRADUATE', 'DEVELOPER'],
  },
  {
    accountStatus: 'ACTIVE',
    affiliationStatus: 'ENROLLED',
    email: 's26000@gsm.hs.kr',
    memberId: 'member-park-seo-jun',
    name: '박서준',
    roles: ['STUDENT'],
  },
];
