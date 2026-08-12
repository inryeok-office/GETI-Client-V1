import { StudentCard } from '@/entities/student';
import { StudentSearchForm } from '@/features/student-search';

import { MOCK_STUDENTS } from '../model/mock';
import { StudentDirectoryState, type StudentDirectoryStatus } from './StudentDirectoryState';

const STATUS_BY_VARIANT: Record<string, StudentDirectoryStatus> = {
  empty: 'empty',
  error: 'error',
  loading: 'loading',
  private: 'private',
};

interface StudentListPageProps {
  searchParams: Promise<{ q?: string; variant?: string }>;
}

export async function StudentListPage({ searchParams }: StudentListPageProps) {
  const { q = '', variant } = await searchParams;
  const normalizedQuery = q.trim().toLocaleLowerCase('ko-KR');
  const filteredStudents = normalizedQuery
    ? MOCK_STUDENTS.filter((student) =>
        student.name.toLocaleLowerCase('ko-KR').includes(normalizedQuery),
      )
    : MOCK_STUDENTS;
  const explicitStatus = variant ? STATUS_BY_VARIANT[variant] : undefined;
  const status = explicitStatus ?? (filteredStudents.length === 0 ? 'empty' : 'success');

  return (
    <main className="relative min-h-[calc(100vh-72px)] bg-[#f7f7f8]">
      <div className="mx-auto max-w-[1312px] px-4 py-10">
        <div className="flex flex-col gap-8">
          <div className="flex flex-col gap-2 px-1">
            <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-neutral-900">
              학생 찾기
            </h1>
            <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
              재학생과 졸업생의 공개 프로필을 찾아보세요.
            </p>
          </div>

          <StudentSearchForm defaultValue={q} />
        </div>

        <p className="mt-8 text-sm leading-[1.5] tracking-[-0.14px] text-neutral-900">
          총 <strong className="font-bold">{MOCK_STUDENTS.length}명</strong>의 학생
        </p>

        {status === 'success' ? (
          <section
            aria-label="학생 검색 결과"
            className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3"
          >
            {filteredStudents.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
          </section>
        ) : (
          <StudentDirectoryState status={status} />
        )}
      </div>
    </main>
  );
}
