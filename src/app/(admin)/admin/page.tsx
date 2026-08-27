import {
  AdminDashboardLive,
  AdminDashboardPage,
  DASHBOARD_CONTENT,
  DASHBOARD_NAV_SECTIONS,
  resolveAdminDashboardVariant,
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

  return (
    <AdminDashboardPage
      content={DASHBOARD_CONTENT[resolvedVariant]}
      navSections={DASHBOARD_NAV_SECTIONS[resolvedVariant]}
    />
  );
}
