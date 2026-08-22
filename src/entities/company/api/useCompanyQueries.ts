'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchAllCompanyOptions } from './companyApi';

export const companyKeys = {
  all: ['companies'] as const,
  options: () => [...companyKeys.all, 'options'] as const,
};

/** 지원자 관리 화면의 "기업" 드롭다운. 상한 없이 전체 기업을 모은다. */
export function useCompanyOptionsQuery() {
  return useQuery({
    queryKey: companyKeys.options(),
    queryFn: fetchAllCompanyOptions,
  });
}
