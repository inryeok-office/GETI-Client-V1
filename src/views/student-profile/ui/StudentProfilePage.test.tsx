import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StudentProfilePage } from './StudentProfilePage';

function renderPage(studentId: string, variant?: string) {
  return StudentProfilePage({
    params: Promise.resolve({ studentId }),
    searchParams: Promise.resolve({ variant }),
  }).then(render);
}

describe('StudentProfilePage', () => {
  it('공개 학생 프로필을 보여준다', async () => {
    await renderPage('student-1');

    expect(screen.getByRole('heading', { level: 1, name: '이름' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '자기소개' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '기술 스택' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 2, name: '링크' })).toBeInTheDocument();
  });

  it('비공개 학생은 비공개 상태를 보여준다', async () => {
    await renderPage('private');

    expect(screen.getByRole('heading', { name: '비공개 프로필입니다.' })).toBeInTheDocument();
  });

  it('존재하지 않는 학생은 확인 불가 상태를 보여준다', async () => {
    await renderPage('unknown');

    expect(
      screen.getByRole('heading', { name: '학생 정보를 확인할 수 없습니다.' }),
    ).toBeInTheDocument();
  });
});
