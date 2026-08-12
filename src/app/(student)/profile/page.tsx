import { MyProfilePage, type MyProfileSaveStatus } from '@/views/my-profile';

interface PageProps {
  searchParams: Promise<{ variant?: string }>;
}

const SAVE_STATUS_BY_VARIANT: Record<string, MyProfileSaveStatus> = {
  error: 'error',
  saving: 'loading',
  success: 'success',
};

export default async function Page({ searchParams }: PageProps) {
  const { variant } = await searchParams;
  const initialSaveStatus = variant ? (SAVE_STATUS_BY_VARIANT[variant] ?? 'idle') : 'idle';

  return <MyProfilePage initialSaveStatus={initialSaveStatus} />;
}
