'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchMyProfile } from './meApi';

export const memberKeys = {
  all: ['member'] as const,
  profile: () => [...memberKeys.all, 'me', 'profile'] as const,
  majors: () => [...memberKeys.all, 'metadata', 'majors'] as const,
  techStacks: () => [...memberKeys.all, 'metadata', 'tech-stacks'] as const,
};

export function useMyProfileQuery() {
  return useQuery({
    queryKey: memberKeys.profile(),
    queryFn: fetchMyProfile,
    staleTime: 5 * 60_000,
  });
}
