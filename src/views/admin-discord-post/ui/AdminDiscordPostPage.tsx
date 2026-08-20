'use client';

import Link from 'next/link';
import { useState } from 'react';

import {
  type DiscordDelivery,
  type DiscordDeliveryStatus,
  type DiscordDeliveryType,
} from '@/entities/discord-delivery';
import { Icon } from '@/shared/ui/icon';

type FilterKey = 'type' | 'target' | 'channel';

const STATUS_LABEL: Record<DiscordDeliveryStatus, string> = {
  success: '성공',
  failed: '실패',
};

const TYPE_LABEL: Record<DiscordDeliveryType, string> = {
  job: '공고',
  program: '프로그램',
};

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'type', label: '유형' },
  { key: 'target', label: '대상' },
  { key: 'channel', label: '채널' },
];

/**
 * 드롭다운 선택지. Figma가 캡처한 5개 드롭다운(job-list · admin-applicant)과 동일한 패턴 —
 * 목록의 첫 옵션을 고르면 해당 필터를 해제한 것으로 본다. 채널만 "전체"를 뜻하는 값이
 * "#전체-공지"라서 CLEAR_VALUE로 필터별 해제 값을 따로 둔다.
 */
const DROPDOWN_OPTIONS: Record<FilterKey, string[]> = {
  type: ['전체', '채용 공고', '프로그램', '공지사항'],
  target: ['전체', '8기', '9기', '10기'],
  channel: ['#전체-공지', '#취업-공지', '#개발자', '#취업연계-프로젝트'],
};

const CLEAR_VALUE: Record<FilterKey, string> = {
  type: '전체',
  target: '전체',
  channel: '#전체-공지',
};

/** Figma(node 586:15675) 테이블 컬럼 폭을 그대로 옮겼다 — 7개 컬럼이 동일한 폭이 아니다. */
const TABLE_COLUMNS = [
  { label: '대상', widthClass: 'w-[430px]' },
  { label: '유형', widthClass: 'w-[160px]' },
  { label: '채널', widthClass: 'w-[240px]' },
  { label: '요청 시각', widthClass: 'w-[220px]' },
  { label: '상태', widthClass: 'w-[160px]' },
  { label: '재시도', widthClass: 'w-[160px]' },
  { label: '관리', widthClass: 'w-[250px]' },
];

interface AdminDiscordPostPageProps {
  deliveries: DiscordDelivery[];
  /** ?variant=error일 때 전송 실패 오류 문구를 확인용으로 바로 띄운다. */
  variant?: 'error';
  /** /admin/discord-posts/[deliveryId]로 들어왔을 때 그 id가 있으면 상세 패널을 목록 위에 띄운다. */
  detailId?: string;
  /** id에 해당하는 전송 이력. 못 찾으면 패널을 띄우지 않는다(목록만 보인다). */
  detail?: DiscordDelivery;
}

/**
 * Discord 게시 관리 화면. 필터 바 + 전송 이력 테이블 + 전송 상세 패널을 조합한다.
 * 디자인 단계라 Discord 전송, 재시도, 다시 전송은 실제로 동작하지 않는다.
 * 필터 드롭다운은 옵션을 고르면 실제로 선택되어 버튼 라벨이 바뀐다("전체"/"#전체-공지"를
 * 고르면 해제된다) — job-list · admin-applicant 필터와 동일한 패턴이다.
 * 상세 패널은 클라이언트 상태가 아니라 실제 라우트(/admin/discord-posts/[deliveryId])로 열고,
 * 닫기는 목록 경로로 돌아가는 링크다 — 뒤로가기 · 새로고침 · 공유가 전부 자연스럽게 동작한다.
 * 간격 · 색상은 Figma(node 586:15675, 드롭다운은 1227:14609 등, 상세 패널 실패는 586:15962, 성공은 1343:14098)의 값을 그대로 옮겼다.
 * "다시 전송" 버튼은 성공 건에는 없다(Figma 성공 디자인 기준) — 실패 건에서만 보여준다.
 * Discord 전송 · 재시도 API 연동 이슈에서 실제 상태를 붙인다.
 */
export function AdminDiscordPostPage({
  deliveries,
  variant,
  detailId,
  detail,
}: AdminDiscordPostPageProps) {
  const [openFilter, setOpenFilter] = useState<FilterKey | null>(null);
  const [selected, setSelected] = useState<Partial<Record<FilterKey, string>>>({});
  const showError = variant === 'error';

  const selectOption = (key: FilterKey, option: string) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (option === CLEAR_VALUE[key] || prev[key] === option) {
        delete next[key];
      } else {
        next[key] = option;
      }
      return next;
    });
    setOpenFilter(null);
  };

  return (
    <div className="bg-[#fafafa]">
      <header className="flex h-[80px] items-center justify-between border-b border-[#e5e5e5] bg-white px-[40px]">
        <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">
          Discord 게시 관리
        </p>
        <div className="flex items-center gap-[12px]">
          <span className="size-[32px] rounded-full bg-[#eaf6f9]" />
          <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
            개발자 · 외 1개
          </p>
          <Icon name="chevronRight" className="h-[12px] w-[24px] rotate-90 text-[#525252]" />
        </div>
      </header>

      <main className="flex flex-col gap-[24px] px-[40px] py-[40px]">
        <div className="flex flex-col gap-[8px]">
          <h1 className="text-[32px] leading-[1.3] font-semibold tracking-[-0.32px] text-[#111]">
            Discord 게시 관리
          </h1>
          <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#404040]">
            공고와 프로그램 정보를 등록된 Discord 채널로 전송합니다.
          </p>
        </div>

        <div className="flex w-full flex-col items-end gap-[8px]">
          {showError && (
            <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#ef4444]">
              Discord 메시지 전송에 실패했습니다.
            </p>
          )}

          {/* Figma는 한 줄(1620px) 고정 폭이지만, 좁은 화면에서는 필터/버튼이 줄바꿈되게 했다(반응형은 Figma에 없는 부분). */}
          <div className="flex w-full flex-wrap items-center justify-between gap-[12px]">
            <div className="flex flex-wrap items-center gap-[20px]">
              {FILTERS.map((item) => {
                const selectedOption = selected[item.key];

                return (
                  <div key={item.key} className="relative h-[56px] w-[272px]">
                    <button
                      type="button"
                      onClick={() => setOpenFilter((prev) => (prev === item.key ? null : item.key))}
                      className="flex h-full w-full items-center justify-between rounded-[8px] border border-[#e5e5e5] bg-white py-[16px] pr-[8px] pl-[16px] text-[14px] font-medium tracking-[-0.14px] text-[#525252] focus:outline-none"
                    >
                      <span className="truncate">{selectedOption ?? item.label}</span>
                      <span className="flex h-[10px] w-[20px] shrink-0 items-center justify-center">
                        <Icon
                          name="chevronRight"
                          className="h-[20px] w-[10px] rotate-90 text-[#525252]"
                        />
                      </span>
                    </button>

                    {openFilter === item.key && (
                      <div className="absolute top-full left-0 z-20 mt-[4px] flex w-full flex-col gap-[2px] rounded-[8px] border border-[#e5e5e5] bg-white p-[8px] shadow-[0px_8px_24px_-4px_rgba(23,37,45,0.1)]">
                        {DROPDOWN_OPTIONS[item.key].map((option) => {
                          const isSelected = selectedOption
                            ? selectedOption === option
                            : option === CLEAR_VALUE[item.key];

                          return (
                            <button
                              key={option}
                              type="button"
                              onClick={() => selectOption(item.key, option)}
                              className={`flex h-[44px] w-full items-center justify-between rounded-[8px] px-[16px] text-left text-[14px] leading-[21px] tracking-[-0.14px] hover:bg-[#f6fbfc] ${
                                isSelected ? 'bg-[#f6fbfc] text-[#17627a]' : 'text-[#111]'
                              }`}
                            >
                              {option}
                              {isSelected && <Icon name="check" className="size-[20px]" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="flex h-[56px] items-center justify-center rounded-[8px] bg-[#17627a] px-[32px] py-[16px] text-[14px] font-medium tracking-[-0.14px] text-white focus:outline-none"
            >
              Discord 전송
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-[16px]">
          <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">전송 이력</p>

          {/* 테이블 자체 폭(1620px)은 Figma 그대로 두고, 화면이 좁을 땐 이 박스 안에서만 가로 스크롤되게 했다
              (반응형은 Figma에 없는 부분) — 그래야 바깥 rounded 테두리가 페이지 스크롤에 안 끊긴다. */}
          <div className="overflow-x-auto rounded-[12px] border border-[#e5e5e5] bg-white">
            <div className="flex min-w-[1620px] flex-col">
              <div className="flex h-[62px] items-center bg-[#fafafa]">
                {TABLE_COLUMNS.map((column) => (
                  <div
                    key={column.label}
                    className={`${column.widthClass} shrink-0 pr-[8px] pl-[16px]`}
                  >
                    <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#525252]">
                      {column.label}
                    </p>
                  </div>
                ))}
              </div>
              {deliveries.map((delivery) => (
                <div key={delivery.id} className="flex h-[62px] items-center">
                  <div className="w-[430px] shrink-0 pr-[8px] pl-[16px]">
                    <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                      {delivery.target}
                    </p>
                  </div>
                  <div className="w-[160px] shrink-0 pr-[8px] pl-[16px]">
                    <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                      {TYPE_LABEL[delivery.type]}
                    </p>
                  </div>
                  <div className="w-[240px] shrink-0 pr-[8px] pl-[16px]">
                    <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                      {delivery.channel}
                    </p>
                  </div>
                  <div className="w-[220px] shrink-0 pr-[8px] pl-[16px]">
                    <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                      {delivery.requestedAt}
                    </p>
                  </div>
                  <div className="w-[160px] shrink-0 pr-[8px] pl-[16px]">
                    <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                      {STATUS_LABEL[delivery.status]}
                    </p>
                  </div>
                  <div className="w-[160px] shrink-0 px-[20px]">
                    <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#262626]">
                      {delivery.retryCount} / {delivery.maxRetryCount}
                    </p>
                  </div>
                  <div className="w-[250px] shrink-0 pr-[8px] pl-[16px]">
                    <p className="text-[14px] leading-[1.4] font-medium tracking-[-0.14px] text-[#17627a]">
                      <Link href={`/admin/discord-posts/${delivery.id}`}>상세 보기</Link>
                      {delivery.status === 'failed' && (
                        <>
                          {'  ·  '}
                          <button type="button" className="focus:outline-none">
                            재시도
                          </button>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {detailId && detail && (
        <div className="fixed inset-0 z-50 flex">
          {/* Figma는 dim이 사이드바(220px)와 상세 패널(680px)을 덮지 않고 콘텐츠 영역에만 적용된다.
              flex로 짜서 dim이 남는 공간을 자동으로 채우게 했다 — 패널 폭은 좁은 화면에서 사이드바(220px)를
              침범하지 않도록 줄어든다(반응형은 Figma에 없는 부분). */}
          <div className="ml-[220px] flex-1 bg-black/24" />
          <div className="flex w-[680px] max-w-[calc(100vw-220px)] shrink-0 flex-col gap-[24px] overflow-y-auto bg-white px-[32px] py-[24px]">
            <div className="flex items-center justify-between pb-[4px]">
              <p className="text-[20px] leading-[1.4] font-semibold tracking-[-0.2px] text-[#111]">
                Discord 전송 상세
              </p>
              <Link href="/admin/discord-posts" className="focus:outline-none">
                <Icon name="close" className="size-[20px] text-[#111]" />
              </Link>
            </div>

            <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">
              {detail.target}
            </p>
            <p className="text-[14px] leading-[1.5] tracking-[-0.14px] text-[#525252]">
              채널 · {detail.channel}
            </p>

            <div className="flex flex-col gap-[16px] px-[4px]">
              <div className="flex items-center gap-[12px]">
                <p className="w-[120px] text-[12px] tracking-[-0.12px] text-[#525252]">전송 상태</p>
                <p className="text-[14px] tracking-[-0.14px] text-[#262626]">
                  {STATUS_LABEL[detail.status]}
                </p>
              </div>
              <div className="flex items-center gap-[12px]">
                <p className="w-[120px] text-[12px] tracking-[-0.12px] text-[#525252]">요청 시각</p>
                <p className="text-[14px] tracking-[-0.14px] text-[#262626]">
                  {detail.requestedAtDetail}
                </p>
              </div>
              <div className="flex items-center gap-[12px]">
                <p className="w-[120px] text-[12px] tracking-[-0.12px] text-[#525252]">완료 시각</p>
                <p className="text-[14px] tracking-[-0.14px] text-[#262626]">
                  {detail.completedAtDetail ?? 'ㅡ'}
                </p>
              </div>
              <div className="flex items-center gap-[12px]">
                <p className="w-[120px] text-[12px] tracking-[-0.12px] text-[#525252]">재시도</p>
                <p className="text-[14px] tracking-[-0.14px] text-[#262626]">
                  {detail.retryCount} / {detail.maxRetryCount}회
                </p>
              </div>
            </div>

            {detail.failureReason && (
              <div className="flex flex-col gap-[8px] rounded-[8px] bg-[#fafafa] p-[20px]">
                <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">
                  실패 사유
                </p>
                <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
                  {detail.failureReason}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-[16px]">
              <p className="px-[4px] text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">
                메시지 미리보기
              </p>
              <div className="flex flex-col gap-[8px] rounded-[8px] bg-[#fafafa] p-[20px]">
                <p className="text-[16px] leading-[1.6] tracking-[-0.16px] text-[#111]">
                  {detail.messageTitle}
                </p>
                <p className="text-[12px] leading-[1.5] tracking-[-0.12px] text-[#525252]">
                  {detail.messageBody}
                </p>
              </div>
            </div>

            {detail.status === 'failed' && (
              <button
                type="button"
                className="w-fit text-[14px] font-medium tracking-[-0.14px] text-[#17627a] focus:outline-none"
              >
                다시 전송
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
