import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { CompanyOption } from '@/entities/company';

import { EMPTY_JOB_FORM_VALUES, type AdminJobFormValues } from '../model/jobFormValues';
import { AdminJobForm } from './AdminJobForm';

const COMPANY_OPTIONS: CompanyOption[] = [
  { companyId: 1, name: '플로우테크' },
  { companyId: 2, name: '네오스튜디오' },
];

function renderForm(props: Partial<Parameters<typeof AdminJobForm>[0]> = {}) {
  const onSubmit = vi.fn();
  const onCancel = vi.fn();
  render(
    <AdminJobForm
      mode="create"
      companyOptions={COMPANY_OPTIONS}
      onSubmit={onSubmit}
      onCancel={onCancel}
      {...props}
    />,
  );
  return { onSubmit, onCancel };
}

const FILLED: AdminJobFormValues = {
  ...EMPTY_JOB_FORM_VALUES,
  companyId: '1',
  postingType: 'GENERAL',
  applicationMethod: 'EXTERNAL',
  title: '프론트엔드 채용',
  content: '본문',
  externalUrl: 'https://example.com/apply',
};

describe('AdminJobForm', () => {
  it('필수 identity 필드가 비면 임시저장·게시 버튼이 비활성이다', () => {
    renderForm();

    expect(screen.getByRole('button', { name: '임시저장' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '게시하기' })).toBeDisabled();
  });

  it('identity만 채우면 임시저장은 가능하지만, 본문이 없으면 게시는 막힌다', () => {
    renderForm({
      initialValues: { ...FILLED, content: '', externalUrl: '' },
    });

    expect(screen.getByRole('button', { name: '임시저장' })).toBeEnabled();
    expect(screen.getByRole('button', { name: '게시하기' })).toBeDisabled();
  });

  it('EXTERNAL 공고는 외부 URL이 있어야 게시할 수 있다', () => {
    renderForm({ initialValues: { ...FILLED, externalUrl: '' } });
    expect(screen.getByRole('button', { name: '게시하기' })).toBeDisabled();
  });

  it('외부 URL 형식이 잘못되면 안내를 보여주고 임시저장도 막는다', () => {
    renderForm({ initialValues: { ...FILLED, externalUrl: 'ftp://bad' } });

    expect(screen.getByText('http:// 또는 https:// 로 시작해야 합니다.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '임시저장' })).toBeDisabled();
  });

  it('게시하기를 누르면 status=PUBLISHED로 onSubmit을 호출한다', () => {
    const { onSubmit } = renderForm({ initialValues: FILLED });

    fireEvent.click(screen.getByRole('button', { name: '게시하기' }));

    expect(onSubmit).toHaveBeenCalledWith(FILLED, 'PUBLISHED');
  });

  it('수정 모드에서는 수정하기 버튼 하나만 있고 기업 select가 비활성이다', () => {
    renderForm({ mode: 'edit', initialValues: FILLED });

    expect(screen.queryByRole('button', { name: '게시하기' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '수정하기' })).toBeEnabled();
    // 기업 라벨 아래의 select — 값이 '플로우테크'이고 비활성
    expect(screen.getByDisplayValue('플로우테크')).toBeDisabled();
  });

  it('서버 오류 메시지를 폼 상단 alert로 보여준다', () => {
    renderForm({ serverErrorMessage: '게시 필수값을 확인해 주세요.' });

    expect(screen.getByRole('alert')).toHaveTextContent('게시 필수값을 확인해 주세요.');
  });
});
