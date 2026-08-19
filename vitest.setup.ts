import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { toast } from 'react-hot-toast';
import { afterEach } from 'vitest';

// react-hot-toast가 prefers-reduced-motion을 확인하는데 jsdom엔 matchMedia가 없다.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

// 테스트 간 DOM과 토스트 큐가 남아 다음 테스트에 영향을 주지 않게 한다.
afterEach(() => {
  cleanup();
  toast.remove();
});
