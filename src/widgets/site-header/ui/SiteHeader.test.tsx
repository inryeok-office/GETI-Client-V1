import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SiteHeader } from './SiteHeader';

describe('SiteHeader', () => {
  it('구현된 일반 사용자 화면으로 이동하는 링크를 제공한다', () => {
    render(<SiteHeader activeNav="채용 공고" />);

    expect(screen.getByRole('link', { name: 'GETI 홈' })).toHaveAttribute('href', '/');

    const navigation = screen.getByRole('navigation', { name: '주요 메뉴' });
    expect(within(navigation).getByRole('link', { name: '채용 공고' })).toHaveAttribute(
      'href',
      '/jobs',
    );
    expect(within(navigation).getByRole('link', { name: '채용 공고' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(navigation).getByRole('link', { name: '포트폴리오' })).toHaveAttribute(
      'href',
      '/portfolios',
    );
    expect(within(navigation).getByRole('link', { name: '기업 정보' })).toHaveAttribute(
      'href',
      '/companies',
    );
    expect(screen.getByRole('link', { name: '저장한 공고 보기' })).toHaveAttribute(
      'href',
      '/bookmarks',
    );
    expect(screen.getByRole('link', { name: '알림' })).toHaveAttribute(
      'href',
      '/notifications/preview',
    );
    expect(screen.getByRole('link', { name: '내 프로필 보기' })).toHaveAttribute(
      'href',
      '/profile',
    );
  });

  it('대상 화면이 아직 없는 메뉴는 비활성 상태로 표시한다', () => {
    render(<SiteHeader />);

    const navigation = screen.getByRole('navigation', { name: '주요 메뉴' });

    for (const label of ['AI 추천', '취업 프로그램']) {
      expect(within(navigation).getByText(label)).toHaveAttribute('aria-disabled', 'true');
      expect(within(navigation).queryByRole('link', { name: label })).not.toBeInTheDocument();
    }
  });
});
