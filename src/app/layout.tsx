import type { Metadata } from 'next';

import { MOCK_NOTIFICATIONS } from '@/entities/notification';
import { NotificationPanel } from '@/widgets/notification-panel';
import { STUDENT_NOTIFICATION_POPOVER_ID } from '@/widgets/site-header';

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
        <Providers>
          {children}
          <div
            id={STUDENT_NOTIFICATION_POPOVER_ID}
            popover="auto"
            className="inset-auto top-[72px] right-[max(16px,calc((100%-1280px)/2-56px))] z-50 m-0 w-[420px] max-w-[calc(100vw-32px)] overflow-visible border-0 bg-transparent p-0"
          >
            <NotificationPanel notifications={MOCK_NOTIFICATIONS} />
          </div>
        </Providers>
      </body>
    </html>
  );
}
