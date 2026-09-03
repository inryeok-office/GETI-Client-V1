import { ApiError } from '@/shared/api';

/**
 * 역할·계정 상태 변경 실패 응답을 사용자 문구로 옮긴다.
 * 서버 계약(GETI-Server-V1 #216): 403 자기보호 / 409 허용되지 않는 상태 전이 / 404 없는 회원.
 */
export function toActionErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 403) return '본인 계정의 역할·계정 상태는 변경할 수 없습니다.';
    if (error.status === 409)
      return '계정 상태가 이미 변경되어 있습니다. 최신 정보를 확인해 주세요.';
    if (error.status === 404) return '회원을 찾을 수 없습니다.';
  }
  return error instanceof Error ? error.message : '변경에 실패했습니다.';
}
