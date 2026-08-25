'use client';

import { Toaster } from 'react-hot-toast';

/**
 * `showToast`로 띄운 토스트를 실제로 그려 주는 컨테이너.
 * 토스트를 쓰는 화면(또는 그 화면의 클라이언트 컴포넌트)에서 한 번만 렌더링한다.
 * 뷰포트 상단 고정이라 스크롤해도 남아 있고, 세로 위치는 `showToast`의 `top`으로 조절한다.
 */
export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      containerStyle={{ top: 0, right: 0, bottom: 'auto', left: 0 }}
      gutter={8}
    />
  );
}
