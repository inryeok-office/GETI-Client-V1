import { describe, expect, it } from 'vitest';

import type { AuditLogApiDetail, AuditLogApiListItem } from './types';
import { mapAuditLogDetail, mapAuditLogListItem } from './mapAuditLog';

const BASE_LOG: AuditLogApiListItem = {
  auditLogId: 100,
  actorId: 7,
  actorName: '홍길동',
  actionType: 'COMPANY_UPDATED',
  targetType: 'COMPANY',
  targetId: 12,
  result: 'FAILURE',
  requestPath: '/api/v1/admin/companies/12',
  maskedDetail: '기업 정보 수정에 실패했습니다.',
  createdAt: '2026-08-22T10:15:30',
};

describe('audit log mapper', () => {
  it('서버 목록 항목의 실패 결과와 표시값을 UI 모델로 변환한다', () => {
    expect(mapAuditLogListItem(BASE_LOG)).toMatchObject({
      auditLogId: 100,
      actor: { memberId: 7, name: '홍길동' },
      result: 'FAILED',
      summary: '기업 정보 수정에 실패했습니다.',
      occurredAt: '2026.08.22 10:15:30',
    });
  });

  it('과거 로그의 NULL 값을 안전한 표시값으로 변환한다', () => {
    expect(
      mapAuditLogListItem({
        ...BASE_LOG,
        actorId: null,
        actorName: null,
        result: null,
        maskedDetail: null,
        requestPath: null,
        targetId: null,
      }),
    ).toMatchObject({
      actor: { memberId: null, name: '알 수 없음' },
      result: 'UNKNOWN',
      requestPath: null,
      targetId: null,
      summary: 'COMPANY_UPDATED',
    });
  });

  it('작업자 ID만 남은 로그의 이름을 알 수 없음으로 표시한다', () => {
    expect(mapAuditLogListItem({ ...BASE_LOG, actorName: null })).toMatchObject({
      actor: { memberId: 7, name: '알 수 없음' },
    });
  });

  it('상세 응답의 변경 목록을 유지한다', () => {
    const detail: AuditLogApiDetail = {
      ...BASE_LOG,
      changes: [{ field: 'name', before: null, after: '새 기업명' }],
    };

    expect(mapAuditLogDetail(detail).changes).toEqual([
      { field: 'name', before: null, after: '새 기업명' },
    ]);
  });
});
