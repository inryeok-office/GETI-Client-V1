import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AdminCompanyDetailEmptyState } from './AdminCompanyDetailEmptyState';

describe('AdminCompanyDetailEmptyState', () => {
  it('loading 상태에서는 로딩 문구를 표시한다', () => {
    render(<AdminCompanyDetailEmptyState status="loading" />);

    expect(screen.getByText('정보를 불러오는 중입니다.')).toBeInTheDocument();
    expect(screen.getByText('잠시만 기다려 주세요.')).toBeInTheDocument();
  });

  it('network-error 상태에서는 오류 문구를 표시한다', () => {
    render(<AdminCompanyDetailEmptyState status="network-error" />);

    expect(screen.getByText('기업 정보를 불러오지 못했습니다.')).toBeInTheDocument();
    expect(screen.getByText('잠시 후 다시 시도해 주세요.')).toBeInTheDocument();
  });
});
