import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AuthExpiredPage } from './AuthExpiredPage';

describe('AuthExpiredPage', () => {
  it('로그인 만료 안내와 로그인 링크를 보여준다', () => {
    render(<AuthExpiredPage />);

    expect(screen.getByRole('heading', { name: '로그인이 만료되었습니다.' })).toBeInTheDocument();
    expect(screen.getByText('작성 중인 내용이 임시 저장되었습니다.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: '다시 로그인' })).toHaveAttribute('href', '/login');
  });
});
