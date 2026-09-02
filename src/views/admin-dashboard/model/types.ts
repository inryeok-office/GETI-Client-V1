export type DashboardVariant = 'admin' | 'staff' | 'developer';

export type DashboardTone = 'brand' | 'warning' | 'success' | 'danger' | 'neutral';

export interface KpiCardData {
  id: string;
  badgeLabel: string;
  tone: DashboardTone;
  count: string;
  description: string;
  /** 실데이터 연동 카드의 조회 상태. 지정하지 않으면 정적(Mock) 카드다. */
  loadState?: 'loading' | 'error';
  /** `loadState`가 'error'일 때 재시도 콜백. */
  onRetry?: () => void;
  /** 서버에 대응 API가 없어 이번 연동에서 제외한 카드. `count` 대신 "미지원"을 표시한다. */
  unsupported?: boolean;
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
  /** 실데이터 조회 중이면 행 대신 로딩 표시를 보여준다. */
  isLoading?: boolean;
  /** 실데이터 조회 실패 시 행 대신 재시도 UI를 보여준다. 지정하지 않으면 정적(Mock) 표다. */
  hasError?: boolean;
  /** `hasError`일 때 재시도 콜백. */
  onRetry?: () => void;
  /** 로딩·에러가 아닌데 `rows`가 비었을 때 보여줄 문구. 지정하지 않으면 빈 표를 그대로 렌더한다. */
  emptyLabel?: string;
  /** 여러 소스 중 일부만 실패했을 때 표 위에 띄우는 경고 문구(부분 실패). */
  noticeLabel?: string;
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
  /** 알림 사이드바 조회 상태. 지정하지 않으면 정적(Mock) 사이드바다. */
  notificationsLoadState?: 'loading' | 'error';
  /** `notificationsLoadState`가 'error'일 때 재시도 콜백. */
  onNotificationsRetry?: () => void;
  /** 로딩·에러가 아닌데 `notifications`가 비었을 때 보여줄 문구. */
  notificationsEmptyLabel?: string;
}
