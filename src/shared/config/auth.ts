export type OAuthProvider = 'DG' | 'GOOGLE';

export function getOAuthAuthorizeUrl(provider: OAuthProvider) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!apiBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL이 설정되지 않았습니다.');
  }

  return `${apiBaseUrl.replace(/\/$/, '')}/api/v1/auth/${provider}/authorize`;
}
