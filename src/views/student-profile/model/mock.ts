import type { StudentProfile } from '@/entities/student';

export const MOCK_STUDENT_PROFILE: StudentProfile = {
  cohort: 10,
  id: 'student-1',
  introduction:
    'UXUI 디자이너를 목표로 공부하고 있습니다. 사용하기 편한 서비스를 만드는 것에 관심이 있습니다.',
  links: [
    { href: 'https://github.com', icon: 'github', label: 'GitHub' },
    { href: '#portfolio', icon: 'portfolio', label: '포트폴리오' },
    { icon: 'blog', isPrivate: true, label: '블로그' },
  ],
  major: '스마트IoT과',
  name: '이름',
  skills: ['React', 'TypeScript', 'Next.js', 'Figma'],
};
