import type {
  AdminCompanyListItem,
  AdminCompanyRecord,
  CompanyDetail,
  CompanyListItem,
} from './types';

/** `GET /api/v1/companies` 목록 항목을 기업 목록 카드가 쓰는 형태로 변환한다. */
export function mapCompanyListItem(item: AdminCompanyListItem): CompanyListItem {
  return {
    id: String(item.companyId),
    name: item.name,
    isMou: item.mouStatus === 'ACTIVE',
    companyType: item.companyType,
    detailHref: `/companies/${item.companyId}`,
  };
}

/** `GET /api/v1/companies/{id}` 상세 응답을 기업 상세 화면이 쓰는 형태로 변환한다. */
export function mapCompanyDetail(record: AdminCompanyRecord): CompanyDetail {
  return {
    id: String(record.companyId),
    name: record.name,
    isMou: record.mouStatus === 'ACTIVE',
    companyType: record.companyType,
    industry: record.industry ?? '',
    address: record.address ?? '',
    introduction: record.description ?? '',
    homepageUrl: record.homepageUrl ?? '',
  };
}
