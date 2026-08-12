import Link from 'next/link';

import { Icon } from '@/shared/ui/icon';

import { MOCK_STUDENT_PROFILE } from '../model/mock';
import { StudentProfileContent } from './StudentProfileContent';
import { StudentProfileState, type StudentProfileStatus } from './StudentProfileState';

interface StudentProfilePageProps {
  params: Promise<{ studentId: string }>;
  searchParams: Promise<{ variant?: string }>;
}

export async function StudentProfilePage({ params, searchParams }: StudentProfilePageProps) {
  const [{ studentId }, { variant }] = await Promise.all([params, searchParams]);
  const status = getProfileStatus(studentId, variant);

  return (
    <main className="relative min-h-[calc(100vh-72px)] bg-neutral-100">
      <div className="mx-auto max-w-[1312px] px-4 py-10">
        <Link
          href="/students"
          className="focus-visible:outline-primary-700 inline-flex items-center gap-1 text-base leading-[1.6] tracking-[-0.16px] text-neutral-600 focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          <Icon name="arrowUp" className="size-5 -rotate-90 text-neutral-600" />
          학생 찾기로 돌아가기
        </Link>

        {status ? (
          <StudentProfileState status={status} />
        ) : (
          <StudentProfileContent student={MOCK_STUDENT_PROFILE} />
        )}
      </div>
    </main>
  );
}

function getProfileStatus(studentId: string, variant?: string): StudentProfileStatus | undefined {
  if (variant === 'private' || studentId === 'private') return 'private';
  if (variant === 'unavailable' || !/^student-[1-7]$/.test(studentId)) return 'unavailable';
  return undefined;
}
