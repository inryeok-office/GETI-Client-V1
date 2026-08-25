import Image from 'next/image';

import { Icon } from '@/shared/ui/icon';

export type StudentProfileStatus = 'error' | 'forbidden' | 'loading' | 'private' | 'unavailable';

interface StudentProfileStateProps {
  onRetry: () => void;
  status: StudentProfileStatus;
}

const STATE_COPY: Record<StudentProfileStatus, { description: string; title: string }> = {
  error: {
    description: '잠시 후 다시 시도해 주세요.',
    title: '학생 프로필을 불러오지 못했습니다.',
  },
  forbidden: {
    description: '현재 계정으로는 이 학생 프로필을 조회할 수 없습니다.',
    title: '프로필을 볼 권한이 없습니다.',
  },
  loading: {
    description: '잠시만 기다려 주세요.',
    title: '학생 프로필을 불러오는 중입니다.',
  },
  private: {
    description: '이 프로필은 비공개로 설정되어 있습니다.',
    title: '비공개 프로필입니다.',
  },
  unavailable: {
    description: '존재하지 않거나 탈퇴·비활성화된 학생입니다.',
    title: '학생 정보를 확인할 수 없습니다.',
  },
};

export function StudentProfileState({ onRetry, status }: StudentProfileStateProps) {
  const copy = STATE_COPY[status];

  return (
    <section
      className="flex min-h-[500px] flex-col items-center justify-center gap-6 text-center"
      aria-live={status === 'loading' ? 'polite' : undefined}
    >
      {status === 'private' ? (
        <Image src="/icons/student-lock-large.svg" alt="" width={72} height={72} />
      ) : status === 'unavailable' ? (
        <span className="relative block h-[100px] w-24" aria-hidden="true">
          <Image src="/icons/student-unavailable.svg" alt="" width={96} height={100} />
          <Image
            src="/icons/student-unavailable-minus.svg"
            alt=""
            width={20}
            height={20}
            className="absolute top-[73px] left-[71px]"
          />
        </span>
      ) : (
        <Icon
          name={status === 'loading' ? 'spinner' : 'alertCircleOutline'}
          className={`size-[72px] text-neutral-500 ${status === 'loading' ? 'animate-spin' : ''}`}
        />
      )}

      <div className={`flex flex-col items-center ${status === 'error' ? 'gap-4' : ''}`}>
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
            {copy.title}
          </h1>
          <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
            {copy.description}
          </p>
        </div>

        {status === 'error' ? (
          <button
            type="button"
            onClick={onRetry}
            className="bg-primary-700 hover:bg-primary-600 rounded-lg px-6 py-3 text-sm font-medium text-white"
          >
            다시 시도
          </button>
        ) : null}
      </div>
    </section>
  );
}
