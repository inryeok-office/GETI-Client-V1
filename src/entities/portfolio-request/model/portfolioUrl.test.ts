import { describe, expect, it } from 'vitest';

import { isSafePortfolioUrl } from './portfolioUrl';

describe('isSafePortfolioUrl', () => {
  it.each(['https://example.com', 'http://example.com'])('%s 링크를 허용한다', (url) => {
    expect(isSafePortfolioUrl(url)).toBe(true);
  });

  it.each(['javascript:alert(1)', 'ftp://example.com', 'not-a-url'])(
    '%s 링크를 거부한다',
    (url) => {
      expect(isSafePortfolioUrl(url)).toBe(false);
    },
  );
});
