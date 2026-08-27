'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import { useSessionQuery, type SessionRole } from '@/entities/session';
import { ApiError } from '@/shared/api';
import { Button } from '@/shared/ui/button';

interface SessionGuardProps {
  allowedRoles: readonly SessionRole[];
  children: ReactNode;
}

type SessionRedirectPath = '/auth/expired' | '/forbidden' | '/network-error';

function getErrorRedirectPath(error: unknown): SessionRedirectPath | null {
  if (!(error instanceof ApiError)) return null;
  if (error.status === 401) return '/auth/expired';
  if (error.status === 403) return '/forbidden';
  if (error.status === undefined) return '/network-error';
  return null;
}

function SessionLoadingState({ isRedirecting }: { isRedirecting: boolean }) {
  return (
    <main
      role="status"
      className="flex min-h-dvh items-center justify-center bg-neutral-50 px-4 text-sm text-neutral-600"
    >
      {isRedirecting ? '접근 가능한 페이지로 이동 중입니다.' : '로그인 정보를 확인하는 중입니다.'}
    </main>
  );
}

function SessionErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-neutral-50 px-4">
      <section
        role="alert"
        className="flex max-w-md flex-col items-center gap-4 rounded-2xl bg-white px-8 py-10 text-center"
      >
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-neutral-900">
            로그인 정보를 확인하지 못했습니다.
          </h1>
          <p className="text-sm text-neutral-600">잠시 후 다시 시도해 주세요.</p>
        </div>
        <Button onClick={onRetry}>다시 시도</Button>
      </section>
    </main>
  );
}

export function SessionGuard({ allowedRoles, children }: SessionGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const sessionQuery = useSessionQuery();
  const errorRedirectPath = sessionQuery.isError ? getErrorRedirectPath(sessionQuery.error) : null;
  const hasAllowedRole =
    sessionQuery.data?.roles.some((role) => allowedRoles.includes(role)) ?? false;
  const redirectPath =
    errorRedirectPath ?? (sessionQuery.data && !hasAllowedRole ? '/forbidden' : null);

  useEffect(() => {
    if (redirectPath && pathname !== redirectPath) router.replace(redirectPath);
  }, [pathname, redirectPath, router]);

  if (sessionQuery.isPending || redirectPath) {
    return <SessionLoadingState isRedirecting={redirectPath !== null} />;
  }

  if (sessionQuery.isError) {
    return <SessionErrorState onRetry={() => void sessionQuery.refetch()} />;
  }

  return children;
}
