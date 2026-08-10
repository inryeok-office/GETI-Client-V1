import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ProfileOnboardingPage } from './ProfileOnboardingPage';

describe('ProfileOnboardingPage', () => {
  it('최초 프로필 입력 항목을 표시한다', () => {
    render(<ProfileOnboardingPage />);

    expect(screen.getByRole('heading', { name: '프로필을 완성해 주세요' })).toBeInTheDocument();
    expect(screen.getByLabelText('기술 스택 *')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '프로필 등록 완료' })).toBeInTheDocument();
  });
});
