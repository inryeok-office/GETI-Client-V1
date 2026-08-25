import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LandingPage } from './LandingPage';

describe('LandingPage', () => {
  it('서비스 소개와 로그인 진입 링크를 표시한다', () => {
    render(<LandingPage />);

    expect(screen.getByRole('heading', { name: /학교 취업 정보를/ })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: '로그인 하기' })[0]).toHaveAttribute(
      'href',
      '/login',
    );
    expect(screen.getByText('나를 위한 추천 공고')).toBeInTheDocument();
  });
});
