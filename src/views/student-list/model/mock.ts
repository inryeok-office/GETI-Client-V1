import type { StudentListItem } from '@/entities/student';

export const MOCK_STUDENTS: StudentListItem[] = Array.from({ length: 7 }, (_, index) => ({
  cohort: 10,
  id: `student-${index + 1}`,
  major: '스마트IoT과',
  name: '이름',
}));
