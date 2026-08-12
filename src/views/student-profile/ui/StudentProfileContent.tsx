import Image from 'next/image';

import type { StudentProfile, StudentProfileLink } from '@/entities/student';
import { Icon } from '@/shared/ui/icon';

interface StudentProfileContentProps {
  student: StudentProfile;
}

const LINK_ICON_PATH: Record<StudentProfileLink['icon'], string> = {
  blog: '/icons/student-blog.svg',
  github: '/icons/student-github.svg',
  portfolio: '/icons/student-portfolio.svg',
};

export function StudentProfileContent({ student }: StudentProfileContentProps) {
  return (
    <div className="mt-6">
      <section className="flex h-[184px] items-center gap-6 rounded-lg border border-neutral-200 bg-white p-8">
        <span className="size-[88px] shrink-0 rounded-full bg-neutral-100" aria-hidden="true" />
        <div className="min-w-0">
          <h1 className="truncate text-[28px] leading-[1.3] font-semibold tracking-[-0.28px] text-neutral-900">
            {student.name}
          </h1>
          <p className="mt-3 text-base leading-[1.6] tracking-[-0.16px] text-neutral-600">
            {student.cohort}기 · {student.major}
          </p>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,824px)_minmax(0,432px)]">
        <div className="flex flex-col gap-6">
          <ProfileSection title="자기소개">
            <p className="pt-5 text-[15px] leading-[26px] text-neutral-900">
              {student.introduction}
            </p>
          </ProfileSection>

          <ProfileSection title="기술 스택">
            <ul className="flex flex-wrap gap-2 pt-5" aria-label="기술 스택 목록">
              {student.skills.map((skill) => (
                <li
                  key={skill}
                  className="bg-primary-100 text-primary-700 flex h-8 items-center rounded-2xl px-3 text-[13px] leading-5 font-semibold"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </ProfileSection>
        </div>

        <section className="min-h-[404px] rounded-lg border border-neutral-200 bg-white p-8">
          <h2 className="text-lg leading-[26px] font-bold tracking-[-0.3px] text-neutral-900">
            링크
          </h2>
          <div className="flex flex-col gap-2 pt-5">
            {student.links.map((link) => (
              <ProfileLink key={link.label} link={link} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ProfileSection({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="min-h-[190px] rounded-lg border border-neutral-200 bg-white p-8">
      <h2 className="text-lg leading-[26px] font-bold tracking-[-0.3px] text-neutral-900">
        {title}
      </h2>
      {children}
    </section>
  );
}

function ProfileLink({ link }: { link: StudentProfileLink }) {
  const content = (
    <>
      <Image src={LINK_ICON_PATH[link.icon]} alt="" width={24} height={24} />
      <span className="min-w-0 flex-1 truncate text-[15px] leading-[26px] font-semibold text-neutral-900">
        {link.label}
      </span>
      {link.isPrivate ? (
        <Image src="/icons/student-lock.svg" alt="비공개" width={20} height={20} />
      ) : (
        <Icon name="externalLink" className="size-5 text-neutral-500" />
      )}
    </>
  );
  const className =
    'flex h-14 items-center gap-3 rounded-[9px] border border-neutral-200 bg-white px-4';

  return link.href ? (
    <a
      href={link.href}
      className={`${className} focus-visible:outline-primary-700 transition-colors hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2`}
      target={link.href.startsWith('http') ? '_blank' : undefined}
      rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
    >
      {content}
    </a>
  ) : (
    <div className={className}>{content}</div>
  );
}
