import type { Metadata } from 'next';

import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'GETI',
  description: '채용 공고를 모아 보고 맞춤 추천을 받는 서비스',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
