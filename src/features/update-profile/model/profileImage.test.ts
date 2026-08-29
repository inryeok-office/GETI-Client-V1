import { describe, expect, it } from 'vitest';

import { getProfileImageValidationError, PROFILE_IMAGE_ACCEPT } from './profileImage';

describe('profileImage', () => {
  it('프로필 이미지 정책과 일치하는 파일 형식을 허용한다', () => {
    expect(PROFILE_IMAGE_ACCEPT).toBe('.png,.jpg,.jpeg,.webp');
    expect(
      getProfileImageValidationError(new File(['image'], 'profile.webp', { type: 'image/webp' })),
    ).toBeNull();
  });

  it('확장자와 실제 콘텐츠 형식이 다르면 거부한다', () => {
    expect(
      getProfileImageValidationError(new File(['image'], 'profile.png', { type: 'image/jpeg' })),
    ).toContain('지원하지 않는 이미지');
  });

  it('브라우저가 MIME 형식을 제공하지 않으면 허용 확장자로 검증한다', () => {
    expect(
      getProfileImageValidationError(new File(['image'], 'profile.webp', { type: '' })),
    ).toBeNull();
  });

  it('5MB를 초과한 이미지를 거부한다', () => {
    const file = new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'profile.png', {
      type: 'image/png',
    });

    expect(getProfileImageValidationError(file)).toContain('5MB 이하');
  });
});
