export type DashboardVariant = 'admin' | 'staff' | 'developer';

export type DashboardTone = 'brand' | 'warning' | 'success' | 'danger' | 'neutral';

export interface KpiCardData {
  id: string;
  badgeLabel: string;
  tone: DashboardTone;
  count: string;
  description: string;
}

export interface DashboardTableCell {
  label: string;
  /** 지정하지 않으면 일반 텍스트, 'badge'는 색이 있는 알약, 'link'는 브랜드 색 링크 텍스트다. */
  variant?: 'badge' | 'link';
  tone?: DashboardTone;
}

export interface DashboardTableRow {
  id: string;
  cells: DashboardTableCell[];
}

export interface DashboardTable {
  title: string;
  columns: string[];
  rows: DashboardTableRow[];
}

export interface DashboardNotification {
  id: string;
  tone: DashboardTone;
  title: string;
  subtitle: string;
}

export interface DashboardContent {
  headerTitle: string;
  roleLabel: string;
  pageTitle: string;
  pageDescription: string;
  kpiCards: KpiCardData[];
  table: DashboardTable;
  notificationTitle: string;
  /** Figma 원본에서 관리자만 시맨틱 토큰(#111)을, 교직원·개발자는 하드코딩된 #1f2933을 썼다. */
  notificationTitleColor: string;
  notifications: DashboardNotification[];
}
