import {
  STUDENT_DEPARTMENT_LABELS,
  type StudentListItem,
  type StudentProfile,
  type StudentProfileLink,
  type StudentProfileLinkResponse,
  type StudentProfileResponse,
  type StudentSearchItem,
} from './types';

function formatStudentSummary(
  cohort: number | null,
  department: StudentSearchItem['department'],
  majors: string[] = [],
): string {
  const parts = [
    cohort === null ? undefined : `${cohort}기`,
    department === null ? undefined : STUDENT_DEPARTMENT_LABELS[department],
    ...majors,
  ].filter((part): part is string => Boolean(part));

  return parts.length > 0 ? parts.join(' · ') : '학적 정보 미등록';
}

export function mapStudentSearchItem(student: StudentSearchItem): StudentListItem {
  return {
    id: String(student.memberId),
    name: student.name,
    summary: formatStudentSummary(student.cohort, student.department),
  };
}

export function mapStudentProfile(profile: StudentProfileResponse): StudentProfile {
  return {
    desiredJob: profile.desiredJob?.trim() || undefined,
    id: String(profile.memberId),
    introduction: profile.bio?.trim() || '소개가 등록되지 않았습니다.',
    links: profile.links.filter((link) => isSafeProfileUrl(link.url)).map(mapStudentProfileLink),
    name: profile.name,
    skills: profile.techStacks,
    summary: formatStudentSummary(profile.cohort, profile.department, profile.majors),
  };
}

function isSafeProfileUrl(url: string): boolean {
  try {
    const protocol = new URL(url).protocol;
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

function mapStudentProfileLink(link: StudentProfileLinkResponse): StudentProfileLink {
  const searchableValue = `${link.label} ${link.url}`.toLocaleLowerCase('en-US');
  const icon: StudentProfileLink['icon'] = searchableValue.includes('github')
    ? 'github'
    : searchableValue.includes('blog')
      ? 'blog'
      : 'portfolio';

  return { href: link.url, icon, label: link.label };
}
