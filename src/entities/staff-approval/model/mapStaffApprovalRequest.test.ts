import { describe, expect, it } from 'vitest';

import { mapStaffApprovalRequest } from './mapStaffApprovalRequest';
import type { AdminMemberSearchItem, AdminMemberStatus } from './types';

function searchItem(overrides: Partial<AdminMemberSearchItem> = {}): AdminMemberSearchItem {
  return {
    memberId: 1,
    email: 'teacher@gsm.hs.kr',
    name: '이름',
    status: 'PENDING',
    createdAt: '2026-08-01T09:24:00',
    ...overrides,
  };
}

describe('mapStaffApprovalRequest', () => {
  it.each<[AdminMemberStatus, string]>([
    ['PENDING', 'pending'],
    ['ACTIVE', 'approved'],
    ['REJECTED', 'rejected'],
  ])('서버 상태 %s를 화면 상태 %s로 매핑한다', (serverStatus, expected) => {
    const result = mapStaffApprovalRequest(searchItem({ status: serverStatus }));

    expect(result).not.toBeNull();
    expect(result?.status).toBe(expected);
    expect(result).toMatchObject({ memberId: 1, email: 'teacher@gsm.hs.kr', name: '이름' });
  });

  it.each<AdminMemberStatus>(['SUSPENDED', 'WITHDRAWN'])(
    '가입 승인 대상이 아닌 상태(%s)는 null을 반환한다',
    (serverStatus) => {
      expect(mapStaffApprovalRequest(searchItem({ status: serverStatus }))).toBeNull();
    },
  );

  it('name이 null이면 대시로 대체한다', () => {
    const result = mapStaffApprovalRequest(searchItem({ name: null }));

    expect(result?.name).toBe('ㅡ');
  });
});
