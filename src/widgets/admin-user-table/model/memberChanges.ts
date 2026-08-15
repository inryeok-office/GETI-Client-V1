import type { MemberRole } from '@/entities/member';

export function areSameRoles(left: MemberRole[], right: MemberRole[]) {
  return left.length === right.length && left.every((role) => right.includes(role));
}
