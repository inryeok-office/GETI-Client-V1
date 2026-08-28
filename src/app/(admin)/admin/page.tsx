import {
  AdminDashboardLive,
  DASHBOARD_NAV_SECTIONS,
  DeveloperDashboardLive,
  newApplicantSince,
  recentFailureSince,
  resolveAdminDashboardVariant,
  StaffDashboardLive,
} from '@/views/admin-dashboard';

interface PageProps {
  searchParams: Promise<{ variant?: string }>;
}

export default async function Page({ searchParams }: PageProps) {
  const { variant } = await searchParams;
  const resolvedVariant = resolveAdminDashboardVariant(variant);

  if (resolvedVariant === 'admin') {
    return <AdminDashboardLive navSections={DASHBOARD_NAV_SECTIONS.admin} />;
  }

  if (resolvedVariant === 'developer') {
    return (
      <DeveloperDashboardLive
        navSections={DASHBOARD_NAV_SECTIONS.developer}
        recentFailureSince={recentFailureSince()}
      />
    );
  }

  return (
    <StaffDashboardLive
      navSections={DASHBOARD_NAV_SECTIONS.staff}
      newApplicantSince={newApplicantSince()}
    />
  );
}
