import { Button } from '@/shared/ui/button';
import { SelectField } from '@/shared/ui/select-field';
import { TextField } from '@/shared/ui/text-field';

const COHORTS = ['8기', '9기', '10기'] as const;
const DEPARTMENTS = ['소프트웨어개발과', '스마트IoT과', 'AI과'] as const;

export function ProfileOnboardingPage() {
  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f7f7f8] px-6 py-16">
      <section className="mx-auto max-w-[858px] rounded-2xl bg-white p-6 shadow-sm sm:p-10">
        <div>
          <h1 className="text-[28px] leading-[1.3] font-semibold tracking-[-0.02em]">
            프로필을 완성해 주세요
          </h1>
          <p className="mt-2 text-sm leading-[1.5] text-neutral-600">
            맞춤 공고 추천을 위해 기본 정보를 입력해 주세요.
          </p>
        </div>

        <div className="mt-8 flex items-center gap-6">
          <div
            className="flex size-[104px] shrink-0 items-center justify-center rounded-full bg-neutral-100 text-4xl text-neutral-400"
            aria-hidden="true"
          >
            ♙
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              프로필 이미지 <span className="text-status-error">*</span>
            </p>
            <p className="mt-2 text-xs text-neutral-600">
              본인을 확인할 수 있는 사진을 등록해 주세요.
            </p>
            <Button variant="outline" className="mt-4 w-full">
              사진 등록
            </Button>
          </div>
        </div>

        <form className="mt-8 space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <fieldset>
              <legend className="mb-2 text-base">
                기수 <span className="text-status-error">*</span>
              </legend>
              <div className="grid grid-cols-3 gap-3">
                {COHORTS.map((cohort) => (
                  <button
                    key={cohort}
                    type="button"
                    className="hover:border-primary-300 rounded-lg border border-neutral-200 px-3 py-4 text-base"
                  >
                    {cohort}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset>
              <legend className="mb-2 text-base">
                학과 <span className="text-status-error">*</span>
              </legend>
              <div className="grid grid-cols-3 gap-3">
                {DEPARTMENTS.map((department) => (
                  <button
                    key={department}
                    type="button"
                    className="hover:border-primary-300 rounded-lg border border-neutral-200 px-3 py-4 text-sm"
                  >
                    {department}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <SelectField label="전공 *" defaultValue="">
              <option value="" disabled>
                전공을 선택하세요.
              </option>
              <option>프론트엔드 개발</option>
              <option>백엔드 개발</option>
              <option>인공지능</option>
            </SelectField>
            <SelectField label="희망 직무/관심 직무 *" defaultValue="">
              <option value="" disabled>
                직무를 선택하세요.
              </option>
              <option>프론트엔드 개발</option>
              <option>백엔드 개발</option>
              <option>AI 엔지니어</option>
            </SelectField>
          </div>
          <div>
            <TextField label="기술 스택 *" placeholder="예: React, Flutter" />
            <p className="mt-2 text-xs text-neutral-600">
              여러 개의 기술을 입력할 수 있습니다. Enter를 눌러 추가하세요.
            </p>
          </div>
          <div>
            <TextField label="전화번호 (선택)" placeholder="010-0000-0000" inputMode="tel" />
            <p className="mt-2 text-xs text-neutral-600">다른 사용자에게 공개되지 않습니다.</p>
          </div>
          <p className="text-status-error text-sm">필수 프로필 정보를 모두 입력해 주세요.</p>
          <Button type="submit" className="w-full">
            프로필 등록 완료
          </Button>
        </form>
      </section>
    </main>
  );
}
