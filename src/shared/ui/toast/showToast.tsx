'use client';

import hotToast from 'react-hot-toast';

import { Toast, type ToastTone } from './Toast';

interface ShowToastOptions {
  tone: ToastTone;
  message: string;
  /**
   * 페이지 상단에서 떨어진 위치(px). Figma가 토스트를 페이지 안 한 지점에 놓아 화면마다 값이 다르다.
   * 기본값은 뒤로가기 링크 + 제목 아래(지원 상세 · 프로그램 상세 기준).
   */
  top?: number;
  /** 같은 id로 다시 호출하면 새 토스트를 쌓지 않고 그 토스트를 바꾼다(진행 → 성공). */
  id?: string;
}

/** 진행 토스트는 결과가 나올 때까지, 결과 토스트는 4초 뒤 자동으로 닫힌다. */
const DURATION_MS: Record<ToastTone, number> = {
  loading: Infinity,
  success: 4000,
  error: 4000,
};

/**
 * 상태 토스트를 띄운다. 렌더링은 `AppToaster`가 하므로 토스트를 쓰는 화면은 그것도 함께 렌더링해야 한다.
 * 가로 위치는 본문(`max-w-[1280px]`) 컨테이너의 오른쪽 끝에 맞춘다(Figma 원본이 그 위치였다).
 */
export function showToast({ tone, message, top = 154, id }: ShowToastOptions) {
  return hotToast.custom(
    (toastInstance) => (
      <div
        style={{ marginTop: top }}
        className={`flex w-[min(100vw,1280px)] justify-end px-4 transition-opacity duration-200 ${
          toastInstance.visible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <Toast tone={tone} message={message} onClose={() => hotToast.dismiss(toastInstance.id)} />
      </div>
    ),
    { id, duration: DURATION_MS[tone] },
  );
}

export const dismissToast = hotToast.dismiss;
