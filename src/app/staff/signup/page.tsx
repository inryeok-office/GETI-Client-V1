import {
  StaffSignupRequestPage,
  resolveStaffSignupRequestVariant,
} from '@/views/staff-signup-request';

interface PageProps {
  searchParams: Promise<{ variant?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { variant } = await searchParams;
  const request = resolveStaffSignupRequestVariant(variant);

  return <StaffSignupRequestPage request={request} />;
}
