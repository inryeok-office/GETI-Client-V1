import Image from 'next/image';

import { Icon } from '@/shared/ui/icon';

export type StudentDirectoryStatus = 'empty' | 'error' | 'idle' | 'loading' | 'private';

interface StudentDirectoryStateProps {
  onRetry: () => void;
  status: StudentDirectoryStatus;
}

const STATE_COPY: Record<StudentDirectoryStatus, { description: string; title: string }> = {
  empty: {
    description: '검색어를 확인하거나 다른 키워드로 검색해보세요.',
    title: '검색 결과가 없습니다.',
  },
  error: {
    description: '잠시 후 다시 시도해 주세요.',
    title: '학생 정보를 불러오지 못했습니다.',
  },
  idle: {
    description: '검색할 학생 이름을 입력해 주세요.',
    title: '학생 공개 프로필을 검색해보세요.',
  },
  loading: {
    description: '잠시만 기다려 주세요.',
    title: '정보를 불러오는 중입니다.',
  },
  private: {
    description: '검색 조건에 맞는 공개 프로필이 없습니다.',
    title: '비공개 프로필만 검색되었습니다.',
  },
};

export function StudentDirectoryState({ onRetry, status }: StudentDirectoryStateProps) {
  const copy = STATE_COPY[status];

  return (
    <section
      className="flex min-h-[360px] flex-col items-center justify-center gap-6 text-center"
      aria-live={status === 'loading' ? 'polite' : undefined}
    >
      {status === 'private' ? (
        <Image src="/icons/student-lock-large.svg" alt="" width={72} height={72} />
      ) : (
        <Icon
          name={
            status === 'empty'
              ? 'searchLarge'
              : status === 'idle'
                ? 'searchLarge'
                : status === 'loading'
                  ? 'spinner'
                  : 'alertCircleOutline'
          }
          className={`size-[72px] text-neutral-500 ${status === 'loading' ? 'animate-spin' : ''}`}
        />
      )}

      <div className={`flex flex-col items-center ${status === 'error' ? 'gap-4' : ''}`}>
        <div className="flex flex-col items-center gap-3">
          <h2 className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
            {copy.title}
          </h2>
          <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
            {copy.description}
          </p>
        </div>

        {status === 'error' ? (
          <button
            type="button"
            onClick={onRetry}
            className="bg-primary-700 hover:bg-primary-600 focus-visible:outline-primary-700 flex h-11 items-center justify-center rounded-lg px-6 text-sm leading-[1.4] font-medium tracking-[-0.14px] text-white transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            다시 시도
          </button>
        ) : null}
      </div>
    </section>
  );
}
