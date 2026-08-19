'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchMyProfile } from './meApi';

export function useMyProfileQuery() {
  return useQuery({
    queryKey: ['me', 'profile'],
    queryFn: fetchMyProfile,
    staleTime: 5 * 60_000,
  });
}
