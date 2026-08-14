import type { DashboardContent, DashboardVariant } from './types';

/**
 * 역할별 대시보드 3종(Figma node 942:21779 관리자 · 942:20791 교직원 · 942:21970 개발자)의
 * 콘텐츠를 그대로 옮겼다. 헤더 타이틀은 세 화면 모두 "대시보드"가 맞는데 관리자 · 교직원
 * 캡처에만 "사용자 관리"가 남아 있어(복사 붙여넣기 흔적으로 보임) "대시보드"로 통일했다.
 */
export const DASHBOARD_CONTENT: Record<DashboardVariant, DashboardContent> = {
  admin: {
    headerTitle: '대시보드',
    roleLabel: '관리자 · 외 1개',
    pageTitle: '관리자 대시보드',
    pageDescription: '담당 업무 현황을 한 눈에 확인하고 빠르게 처리하세요.',
    kpiCards: [
      {
        id: 'signup',
        badgeLabel: '가입 승인 대기',
        tone: 'warning',
        count: '8건',
        description: '교직원 요청',
      },
      {
        id: 'applications',
        badgeLabel: '전체 지원',
        tone: 'brand',
        count: '1,248건',
        description: '전체 지원서',
      },
      {
        id: 'jobs',
        badgeLabel: '공고 상세',
        tone: 'success',
        count: '35건',
        description: '모집/마감/비공개',
      },
      {
        id: 'programs',
        badgeLabel: '프로그램 상태',
        tone: 'brand',
        count: '18건',
        description: '진행/예정/종료',
      },
      {
        id: 'inquiries',
        badgeLabel: '미답변 문의',
        tone: 'danger',
        count: '15건',
        description: '답변 필요',
      },
    ],
    table: {
      title: '전체 지원 처리 현황',
      columns: ['처리 상태', '건수', '비율', '바로가기'],
      rows: [
        {
          id: 'submitted',
          cells: [
            { label: '제출 완료' },
            { label: '42건' },
            { label: '45%' },
            { label: '목록 보기', variant: 'link' },
          ],
        },
        {
          id: 'reviewing',
          cells: [
            { label: '검토 중' },
            { label: '28건' },
            { label: '30%' },
            { label: '목록 보기', variant: 'link' },
          ],
        },
        {
          id: 'revision',
          cells: [
            { label: '수정 요청' },
            { label: '14건' },
            { label: '15%' },
            { label: '목록 보기', variant: 'link' },
          ],
        },
      ],
    },
    notificationTitle: '최근 운영 상태',
    notificationTitleColor: '#111',
    notifications: [
      { id: 'jobs', tone: 'brand', title: '공고', subtitle: '모집 중 16건 · 마감 임박 5건' },
      { id: 'programs', tone: 'brand', title: '프로그램', subtitle: '진행 중 8건 · 종료 12건' },
      { id: 'inquiries', tone: 'brand', title: '미답변 문의', subtitle: '관리자 확인 필요 6건' },
    ],
  },
  staff: {
    headerTitle: '대시보드',
    roleLabel: '교사 · 외 1개',
    pageTitle: '교직원 대시보드',
    pageDescription: '담당 업무 현황을 한 눈에 확인하고 빠르게 처리하세요.',
    kpiCards: [
      {
        id: 'new',
        badgeLabel: '신규 지원자',
        tone: 'warning',
        count: '14건',
        description: '최근 7일 기준',
      },
      {
        id: 'revision',
        badgeLabel: '수정 요청',
        tone: 'warning',
        count: '4건',
        description: '수정 요청 지원서',
      },
      {
        id: 'pending',
        badgeLabel: '기업 전달 대기',
        tone: 'brand',
        count: '7건',
        description: '검토 후 전달 대기',
      },
      {
        id: 'programs',
        badgeLabel: '진행 중 프로그램',
        tone: 'brand',
        count: '6건',
        description: '현재 진행 중',
      },
      {
        id: 'portfolio',
        badgeLabel: '포트폴리오 미제출',
        tone: 'danger',
        count: '9건',
        description: '기한 경과',
      },
    ],
    table: {
      title: '담당 공고 현황',
      columns: ['공고명', '지원자', '처리 대기', '상태'],
      rows: [
        {
          id: 'flowtech',
          cells: [
            { label: '플로우테크 프론트엔드 인턴' },
            { label: '12' },
            { label: '4건' },
            { label: '모집 중', variant: 'badge', tone: 'brand' },
          ],
        },
        {
          id: 'neosystem',
          cells: [
            { label: '네오시스템 백엔드 채용' },
            { label: '5' },
            { label: '2건' },
            { label: '검토중', variant: 'badge', tone: 'warning' },
          ],
        },
        {
          id: 'greenworks',
          cells: [
            { label: '그린웍스 UI/UX 인턴' },
            { label: '9' },
            { label: '1건' },
            { label: '마감', variant: 'badge', tone: 'neutral' },
          ],
        },
      ],
    },
    notificationTitle: '최근 알림',
    notificationTitleColor: '#1f2933',
    notifications: [
      {
        id: 'new-applicant',
        tone: 'brand',
        title: '새로운 지원자 3명이 접수되었습니다.',
        subtitle: '플로우테크 프론트엔드 인턴 · 10분 전',
      },
      {
        id: 'resubmit',
        tone: 'brand',
        title: '수정 요청 답변이 재제출되었습니다.',
        subtitle: '김민재 지원자 · 32분 전',
      },
      {
        id: 'portfolio-due',
        tone: 'brand',
        title: '포트폴리오 제출 기한이 임박했습니다.',
        subtitle: '미제출 9명 · 오늘 09:00',
      },
    ],
  },
  developer: {
    headerTitle: '대시보드',
    roleLabel: '개발자 · 외 1개',
    pageTitle: '개발자 대시보드',
    pageDescription: '담당 업무 현황을 한 눈에 확인하고 빠르게 처리하세요.',
    kpiCards: [
      {
        id: 'system',
        badgeLabel: '정상 시스템',
        tone: 'success',
        count: '3건',
        description: 'Web/DB/Redis 등',
      },
      {
        id: 'discord',
        badgeLabel: 'Discord 실패',
        tone: 'warning',
        count: '2건',
        description: '전송 실패',
      },
      {
        id: 'scheduler',
        badgeLabel: '정기 작업 실패',
        tone: 'danger',
        count: '5건',
        description: '예약 작업',
      },
      {
        id: 'collector',
        badgeLabel: '외부 공고 수집 실패',
        tone: 'danger',
        count: '4건',
        description: '최근 실패',
      },
      {
        id: 'inquiries',
        badgeLabel: '미처리 오류 문의',
        tone: 'warning',
        count: '5건',
        description: '운영 문의',
      },
    ],
    table: {
      title: '최근 실패 내역',
      columns: ['시간', '구분', '내용', '상태'],
      rows: [
        {
          id: 'collector',
          cells: [
            { label: '10:42' },
            { label: '외부 공고 수집' },
            { label: '외부 공고 파싱 실패' },
            { label: '미처리', variant: 'badge', tone: 'danger' },
          ],
        },
        {
          id: 'discord',
          cells: [
            { label: '10:31' },
            { label: 'Discord' },
            { label: '전송 응답 시간 초과' },
            { label: '재시도', variant: 'badge', tone: 'warning' },
          ],
        },
        {
          id: 'scheduler',
          cells: [
            { label: '09:58' },
            { label: '정기 작업' },
            { label: '정기 작업 실행 실패' },
            { label: '미처리', variant: 'badge', tone: 'danger' },
          ],
        },
      ],
    },
    notificationTitle: '최근 운영 알림',
    notificationTitleColor: '#1f2933',
    notifications: [
      {
        id: 'collector',
        tone: 'danger',
        title: '외부 공고 수집 실패 3건이 발생했습니다.',
        subtitle: '외부 공고 수집 · 12분 전',
      },
      {
        id: 'discord',
        tone: 'warning',
        title: 'Discord 전송을 재시도하고 있습니다.',
        subtitle: '실패 5건 · 24분 전',
      },
      {
        id: 'inquiry',
        tone: 'danger',
        title: '미처리 오류 문의가 접수되었습니다.',
        subtitle: '문의 관리 · 41분 전',
      },
    ],
  },
};
