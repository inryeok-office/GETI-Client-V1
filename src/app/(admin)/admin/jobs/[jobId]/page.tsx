import { AdminJobDetailPage } from '@/views/admin-job-detail';

interface PageProps {
  params: Promise<{ jobId: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** 목록에서 붙여 온 검색·필터·페이지 쿼리를 브레드크럼 복귀 링크에 그대로 이어 붙인다. */
const BACK_QUERY_KEYS = ['q', 'status', 'page'] as const;

export default async function Page({ params, searchParams }: PageProps) {
  const { jobId } = await params;
  const resolved = await searchParams;

  const query = new URLSearchParams();
  for (const key of BACK_QUERY_KEYS) {
    const value = resolved[key];
    if (typeof value === 'string' && value !== '') query.set(key, value);
  }
  const queryString = query.toString();

  return (
    <AdminJobDetailPage
      jobId={jobId}
      backHref={queryString ? `/admin/jobs?${queryString}` : '/admin/jobs'}
    />
  );
}
