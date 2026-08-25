import Image from 'next/image';
import Link from 'next/link';

const JOBS = [
  ['NC', '네이버클라우드', '2026 AI 서비스 개발 인턴십 참가자 모집', '외부 · 네이버 채용', 'D-12'],
  ['K', '카카오', '서비스 개발 직무 체험형 인턴', '외부 · 카카오 채용', 'D-17'],
  ['N', 'NHN', '프론트엔드 개발 직무 체험형 인턴', 'MOU · 교내 연계', 'D-8'],
] as const;

const BENEFITS = [
  ['사람인, 잡코리아, 학교 공지를 각각 확인해야 합니다.', ''],
  ['내 기술에 맞는 공고인지 직접 판단해야 합니다.', ''],
  ['지원 일정과 마감일을 놓치기 쉽습니다.', ''],
] as const;

const SOLUTIONS = [
  ['통합 공고 탐색', '여러 채용 사이트와 학교 공고를 한 곳에서 확인할 수 있습니다.'],
  ['AI 맞춤 추천', '학생의 기술과 관심 직무를 분석해 적합한 공고를 추천합니다.'],
  ['지원 관리', '지원 상태와 채용 진행 상황을 한 곳에서 관리할 수 있습니다.'],
] as const;

export function LandingPage() {
  return (
    <main className="overflow-hidden bg-white text-neutral-900">
      <header className="border-b border-neutral-200">
        <div className="mx-auto flex h-[72px] max-w-[1280px] items-center px-4">
          <Link href="/" aria-label="GETI 홈" className="relative block size-14 overflow-hidden">
            <Image
              src="/geti-logo.png"
              alt="GETI"
              width={82}
              height={82}
              priority
              className="absolute top-[-22.73%] left-[-22.73%] max-w-none"
            />
          </Link>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-72px)] max-w-[1280px] items-center gap-16 px-6 py-20 lg:grid-cols-[1fr_612px] lg:px-0">
        <div>
          <h1 className="text-4xl leading-[1.3] font-semibold tracking-[-0.04em] sm:text-[54px]">
            학교 취업 정보를
            <br />한 곳에서 더 쉽게
          </h1>
          <p className="mt-8 text-base leading-[1.6] tracking-[-0.01em] text-neutral-600 sm:text-xl sm:leading-[1.4]">
            민간·공공 채용 서비스와 학교 공고를 한 곳에서 확인하고,
            <br className="hidden sm:block" />
            프로필 정보를 바탕으로 나에게 맞는 공고를 빠르게 찾아보세요.
          </p>
          <Link
            href="/login"
            className="bg-primary-700 hover:bg-primary-600 mt-8 inline-flex rounded-lg px-16 py-3 text-sm font-medium text-white transition-colors"
          >
            로그인 하기
          </Link>
        </div>
        <section
          aria-label="채용 공고 미리보기"
          className="rounded-2xl border border-neutral-200 bg-neutral-50 p-6 shadow-[0_16px_40px_-8px_rgba(23,37,45,0.16)]"
        >
          <h2 className="text-xl font-semibold">채용 공고</h2>
          <div className="mt-5 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-xs text-neutral-600">
            기업명 또는 공고 제목을 검색해 보세요
          </div>
          <div className="mt-3 flex gap-2">
            {['공고 유형', '기업', '모집 상태'].map((item) => (
              <span
                key={item}
                className="rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs text-neutral-600"
              >
                {item}
              </span>
            ))}
          </div>
          <p className="mt-4 text-xs text-neutral-600">총 24개의 공고</p>
          <div className="mt-3 space-y-2">
            {JOBS.map(([initials, company, title, source, deadline]) => (
              <article
                key={title}
                className="flex items-center gap-3 rounded-[10px] border border-neutral-200 bg-white p-3"
              >
                <span className="bg-primary-100 text-primary-700 flex size-10 shrink-0 items-center justify-center rounded-[9px] text-xs font-extrabold">
                  {initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-neutral-600">{company}</p>
                  <h3 className="truncate text-sm font-medium">{title}</h3>
                  <p className="mt-1 text-xs text-neutral-600">{source}</p>
                </div>
                <span className="text-xs font-extrabold text-neutral-600">{deadline}</span>
              </article>
            ))}
          </div>
        </section>
      </section>

      <section className="py-24 sm:py-36">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-0">
          <p className="text-primary-700 text-center text-xs">Problem</p>
          <h2 className="mt-4 text-center text-3xl leading-[1.3] font-semibold tracking-[-0.03em] sm:text-[32px]">
            왜 여러 곳에서 공고를 찾아야 할까요?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-center text-base leading-[1.6] text-neutral-600">
            취업 준비 과정에서 학생들이 자주 겪는 문제
          </p>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {BENEFITS.map(([title, description], index) => (
              <article key={title} className="rounded-2xl border border-neutral-200 bg-white p-7">
                <span className="text-color-neutral-600 rounded-xl text-sm font-semibold">
                  0{index + 1}
                </span>
                <h3 className="mt-6 pr-30 text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-[1.6] text-neutral-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-36">
        <div className="mx-auto max-w-[1280px] px-6 lg:px-0">
          <p className="text-primary-700 text-center text-xs">Solution</p>
          <h2 className="mt-4 text-center text-3xl leading-[1.3] font-semibold tracking-[-0.03em] sm:text-[32px]">
            GETI가 해결합니다
          </h2>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {SOLUTIONS.map(([title, description]) => (
              <article
                key={title}
                className="rounded-2xl border border-neutral-200 bg-white p-7 text-center"
              >
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="mt-4 text-sm leading-[1.6] text-neutral-600">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 sm:py-36">
        <div className="mx-auto grid max-w-[1280px] items-center gap-12 px-6 lg:grid-cols-[1fr_1.15fr] lg:px-0">
          <div>
            <p className="text-primary-700 text-xs">Recommendation</p>
            <h2 className="mt-4 text-3xl leading-[1.3] font-semibold tracking-[-0.03em] sm:text-[32px]">
              프로필 정보를 바탕으로
              <br />
              적합한 공고를 제안합니다.
            </h2>
            <p className="mt-5 text-base leading-[1.6] text-neutral-600">
              전공, 보유 기술, 희망 직무 정보를 분석해 학생이 직접 모든 조건을 비교하지 않아도
              적합한 채용공고를 빠르게 찾을 수 있도록 돕습니다.
            </p>
            <ul className="mt-7 space-y-3 text-sm font-medium text-neutral-600">
              {['전공과 희망 직무 분석', '보유 기술 스택 비교', '지원 가능한 공고 우선 제안'].map(
                (item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="bg-primary-100 text-primary-700 flex size-6 items-center justify-center rounded-xl">
                      ✓
                    </span>
                    {item}
                  </li>
                ),
              )}
            </ul>
          </div>
          <div className="rounded-3xl bg-neutral-100 p-7">
            <div className="rounded-2xl border border-neutral-200 bg-white p-7">
              <h3 className="text-lg font-semibold">나를 위한 추천 공고</h3>
              <article className="mt-5 grid gap-4 rounded-[14px] border border-neutral-200 p-5 sm:grid-cols-[56px_1fr_84px]">
                <span className="flex size-14 items-center justify-center rounded-xl bg-neutral-100 font-extrabold text-neutral-600">
                  NC
                </span>
                <div>
                  <p className="text-sm text-neutral-600">네이버클라우드</p>
                  <h4 className="mt-1 text-base font-semibold">AI 서비스 개발 인턴십</h4>
                  <div className="mt-3 flex gap-2">
                    {['JavaScript', 'Git', 'React'].map((skill) => (
                      <span
                        key={skill}
                        className="rounded-2xl bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-600"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="bg-primary-100 text-primary-700 text-xm rounded-[20px] px-3 py-5 text-center font-semibold">
                  <span className="text-xl">추천</span>

                  <br />
                  <small>AI Match</small>
                </span>
              </article>
              <div className="flex gap-2 py-2">
                <div className="w-50 rounded-lg border border-neutral-200 py-3 pl-2.5">
                  <span className="text-sm text-neutral-600">전공</span>
                  <br></br>
                  <span className="text-sm font-bold text-neutral-900">프론트엔드 개발</span>
                </div>
                <div className="w-50 rounded-lg border border-neutral-200 py-3 pl-2.5">
                  <span className="text-sm text-neutral-600">일치 기술</span>
                  <br></br>
                  <span className="text-sm font-bold text-neutral-900">React, Git</span>
                </div>
                <div className="w-50 rounded-lg border border-neutral-200 py-3 pl-2.5">
                  <span className="text-sm text-neutral-600">지원 조건</span>
                  <br></br>
                  <span className="text-sm font-bold text-neutral-900">고졸, 신입 가능</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-primary-100/40 py-24 text-center">
        <div className="mx-auto max-w-xl px-6">
          <h2 className="text-2xl leading-[1.4] font-semibold">
            <span className="mr-48"> GETI와 함께</span>
            <br />더 효율적으로 취업을 준비하세요.
          </h2>
          <p className="mt-3 text-sm text-neutral-600">
            지금 로그인하고, 나에게 맞는 공고와 기업을 찾아보세요.
          </p>
          <Link
            href="/login"
            className="bg-primary-700 hover:bg-primary-600 mt-6 inline-flex w-78 rounded-lg px-16 py-3 pl-30 text-sm font-medium text-white"
          >
            로그인 하기
          </Link>
        </div>
      </section>
    </main>
  );
}
