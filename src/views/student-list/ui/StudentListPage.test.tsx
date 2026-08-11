import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StudentListPage } from './StudentListPage';

describe('StudentListPage', () => {
  it('학생 카드 7개와 상세 이동 링크를 보여준다', async () => {
    render(await StudentListPage({ searchParams: Promise.resolve({}) }));

    expect(screen.getByRole('heading', { level: 1, name: '학생 찾기' })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: '프로필 보기' })).toHaveLength(7);
    expect(screen.getByText('총', { exact: false })).toHaveTextContent('총 7명의 학생');
  });

  it.each([
    ['empty', '검색 결과가 없습니다.'],
    ['private', '비공개 프로필만 검색되었습니다.'],
    ['loading', '정보를 불러오는 중입니다.'],
    ['error', '학생 정보를 불러오지 못했습니다.'],
  ])('%s 상태를 구분해 보여준다', async (variant, title) => {
    render(await StudentListPage({ searchParams: Promise.resolve({ variant }) }));

    expect(screen.getByRole('heading', { level: 2, name: title })).toBeInTheDocument();
  });

  it('검색 결과가 없으면 빈 상태를 보여준다', async () => {
    render(await StudentListPage({ searchParams: Promise.resolve({ q: '없는 학생' }) }));

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });
});
