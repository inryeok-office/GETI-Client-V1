import Image from 'next/image';

export type StudentProfileStatus = 'private' | 'unavailable';

interface StudentProfileStateProps {
  status: StudentProfileStatus;
}

const STATE_COPY: Record<StudentProfileStatus, { description: string; title: string }> = {
  private: {
    description: '이 프로필은 비공개로 설정되어 있습니다.',
    title: '비공개 프로필입니다.',
  },
  unavailable: {
    description: '존재하지 않거나 탈퇴·비활성화된 학생입니다.',
    title: '학생 정보를 확인할 수 없습니다.',
  },
};

export function StudentProfileState({ status }: StudentProfileStateProps) {
  const copy = STATE_COPY[status];

  return (
    <section className="absolute inset-x-0 top-[calc(50%_-_36px)] flex -translate-y-1/2 flex-col items-center gap-6 text-center">
      {status === 'private' ? (
        <Image src="/icons/student-lock-large.svg" alt="" width={72} height={72} />
      ) : (
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
      )}

      <div className="flex flex-col items-center gap-3">
        <h1 className="text-xl leading-[1.4] font-semibold tracking-[-0.2px] text-neutral-900">
          {copy.title}
        </h1>
        <p className="text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
          {copy.description}
        </p>
      </div>
    </section>
  );
}
