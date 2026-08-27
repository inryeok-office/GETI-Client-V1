'use client';

import { useQuery } from '@tanstack/react-query';

import { fetchSession } from './sessionApi';
import { sessionKeys } from './sessionKeys';

export function useSessionQuery() {
  return useQuery({
    queryKey: sessionKeys.current(),
    queryFn: fetchSession,
  });
}
