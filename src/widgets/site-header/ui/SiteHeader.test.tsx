import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SiteHeader } from './SiteHeader';

describe('SiteHeader', () => {
  it('구현된 일반 사용자 화면으로 이동하는 링크를 제공한다', () => {
    render(<SiteHeader activeNav="채용 공고" />);

    expect(screen.getByRole('link', { name: 'GETI 홈' })).toHaveAttribute('href', '/');

    const navigation = screen.getByRole('navigation', { name: '주요 메뉴' });
    expect(within(navigation).getByRole('link', { name: '채용 공고' })).toHaveAttribute(
      'href',
      '/jobs',
    );
    expect(within(navigation).getByRole('link', { name: '채용 공고' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(navigation).getByRole('link', { name: '포트폴리오' })).toHaveAttribute(
      'href',
      '/portfolios',
    );
    expect(within(navigation).getByRole('link', { name: '기업 정보' })).toHaveAttribute(
      'href',
      '/companies',
    );
    expect(within(navigation).getByRole('link', { name: '취업 프로그램' })).toHaveAttribute(
      'href',
      '/programs',
    );
    expect(screen.getByRole('link', { name: '저장한 공고 보기' })).toHaveAttribute(
      'href',
      '/bookmarks',
    );
    expect(screen.getByRole('button', { name: '알림' })).toHaveAttribute(
      'popovertarget',
      'student-notification-panel',
    );
    expect(screen.getByRole('button', { name: '사용자 메뉴' })).toHaveAttribute(
      'popovertarget',
      'student-profile-menu',
    );
  });

  it('대상 화면이 아직 없는 메뉴는 비활성 상태로 표시한다', () => {
    render(<SiteHeader />);

    const navigation = screen.getByRole('navigation', { name: '주요 메뉴' });

    expect(within(navigation).getByText('AI 추천')).toHaveAttribute('aria-disabled', 'true');
    expect(within(navigation).queryByRole('link', { name: 'AI 추천' })).not.toBeInTheDocument();
  });

  it('알림 버튼을 누르면 팝오버의 확장 상태를 반영한다', () => {
    render(<SiteHeader />);

    const notificationButton = screen.getByRole('button', { name: '알림' });
    const notificationPopover = document.getElementById('student-notification-panel');
    if (!notificationPopover) throw new Error('알림 팝오버를 찾을 수 없습니다.');

    expect(notificationButton).toHaveAttribute('aria-expanded', 'false');

    const openEvent = new Event('toggle');
    Object.defineProperty(openEvent, 'newState', { value: 'open' });
    fireEvent(notificationPopover, openEvent);

    expect(notificationButton).toHaveAttribute('aria-expanded', 'true');

    const closeEvent = new Event('toggle');
    Object.defineProperty(closeEvent, 'newState', { value: 'closed' });
    fireEvent(notificationPopover, closeEvent);

    expect(notificationButton).toHaveAttribute('aria-expanded', 'false');
  });

  it('사용자 메뉴에서 학생 화면으로 이동하는 링크를 제공한다', () => {
    render(<SiteHeader />);

    const profileMenu = document.getElementById('student-profile-menu');
    if (!profileMenu) throw new Error('사용자 메뉴를 찾을 수 없습니다.');

    expect(within(profileMenu).getByText('s0000@gsm.hs.kr')).toBeInTheDocument();
    expect(
      within(profileMenu).getByRole('link', { name: '내 프로필', hidden: true }),
    ).toHaveAttribute('href', '/profile');
    expect(
      within(profileMenu).getByRole('link', { name: '내 지원 내역', hidden: true }),
    ).toHaveAttribute('href', '/applications');
    expect(
      within(profileMenu).getByRole('link', { name: '다른 학생 찾아보기', hidden: true }),
    ).toHaveAttribute('href', '/students');
    expect(within(profileMenu).getByRole('link', { name: '문의', hidden: true })).toHaveAttribute(
      'href',
      '/inquiries',
    );
    expect(
      within(profileMenu).getByRole('link', {
        name: '로그아웃 (인증 연동 예정)',
        hidden: true,
      }),
    ).toHaveAttribute('aria-disabled', 'true');
  });

  it('사용자 메뉴 팝오버의 확장 상태를 반영한다', () => {
    render(<SiteHeader />);

    const profileMenuButton = screen.getByRole('button', { name: '사용자 메뉴' });
    const profileMenu = document.getElementById('student-profile-menu');
    if (!profileMenu) throw new Error('사용자 메뉴를 찾을 수 없습니다.');

    expect(profileMenuButton).toHaveAttribute('aria-expanded', 'false');

    const openEvent = new Event('toggle');
    Object.defineProperty(openEvent, 'newState', { value: 'open' });
    fireEvent(profileMenu, openEvent);

    expect(profileMenuButton).toHaveAttribute('aria-expanded', 'true');

    const closeEvent = new Event('toggle');
    Object.defineProperty(closeEvent, 'newState', { value: 'closed' });
    fireEvent(profileMenu, closeEvent);

    expect(profileMenuButton).toHaveAttribute('aria-expanded', 'false');
  });
});
