'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchMajorMetadata, fetchTechStackMetadata } from './profileSetupApi';
import { memberKeys } from './useMyProfileQuery';

export function useMajorMetadataQuery() {
  return useQuery({
    queryKey: memberKeys.majors(),
    queryFn: ({ signal }) => fetchMajorMetadata(signal),
    staleTime: 30 * 60_000,
  });
}

export function useTechStackMetadataQuery() {
  return useQuery({
    queryKey: memberKeys.techStacks(),
    queryFn: ({ signal }) => fetchTechStackMetadata(signal),
    staleTime: 30 * 60_000,
  });
}
