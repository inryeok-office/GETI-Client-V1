import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { InquiryRegistrationFlow } from './InquiryRegistrationFlow';

const { mockMutateAsync, mockMutationState } = vi.hoisted(() => ({
  mockMutateAsync: vi.fn(),
  mockMutationState: { isPending: false },
}));

vi.mock('@/entities/inquiry', async () => {
  const actual = await vi.importActual<typeof import('@/entities/inquiry')>('@/entities/inquiry');
  return {
    ...actual,
    useCreateInquiryMutation: () => ({
      mutateAsync: mockMutateAsync,
      isPending: mockMutationState.isPending,
    }),
  };
});

function renderFlow(onRegistrationSuccess?: () => void) {
  render(
    <InquiryRegistrationFlow list={<p>문의 목록</p>} onRegistrationSuccess={onRegistrationSuccess}>
      <h1>문의</h1>
    </InquiryRegistrationFlow>,
  );
}

function fillRequiredFields() {
  fireEvent.click(screen.getByLabelText('문의 유형'));
  fireEvent.click(screen.getByRole('option', { name: '오류' }));
  fireEvent.change(screen.getByLabelText('제목'), { target: { value: '서비스 문의' } });
  fireEvent.change(screen.getByLabelText('문의 내용'), {
    target: { value: '서비스 이용 방법이 궁금합니다.' },
  });
}

beforeEach(() => {
  mockMutateAsync.mockReset();
  mockMutateAsync.mockResolvedValue({ inquiryId: 1 });
  mockMutationState.isPending = false;
});

describe('InquiryRegistrationFlow', () => {
  it('문의 등록 버튼으로 모달을 열고 취소할 수 있다', () => {
    renderFlow();

    const openButton = screen.getByRole('button', { name: '문의 등록' });
    openButton.focus();
    fireEvent.click(openButton);

    expect(screen.getByRole('dialog', { name: '문의 등록' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '취소' }));

    expect(screen.queryByRole('dialog', { name: '문의 등록' })).not.toBeInTheDocument();
    expect(openButton).toHaveFocus();
  });

  it('필수값이 비어 있으면 각 입력의 오류를 연결한다', () => {
    renderFlow();
    fireEvent.click(screen.getByRole('button', { name: '문의 등록' }));
    fireEvent.click(screen.getByRole('button', { name: '등록' }));

    expect(screen.getByLabelText('문의 유형')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('제목')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByLabelText('문의 내용')).toHaveAttribute('aria-invalid', 'true');
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('제목은 Backend 계약의 최대 500자로 제한한다', () => {
    renderFlow();
    fireEvent.click(screen.getByRole('button', { name: '문의 등록' }));
    fireEvent.click(screen.getByLabelText('문의 유형'));
    fireEvent.click(screen.getByRole('option', { name: '오류' }));
    fireEvent.change(screen.getByLabelText('제목'), { target: { value: '가'.repeat(501) } });
    fireEvent.change(screen.getByLabelText('문의 내용'), { target: { value: '문의 내용' } });
    fireEvent.click(screen.getByRole('button', { name: '등록' }));

    expect(screen.getByLabelText('제목')).toHaveAttribute('maxLength', '500');
    expect(screen.getByText('제목은 500자 이하로 입력해 주세요.')).toBeInTheDocument();
    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('등록 처리 중에는 폼 입력과 동작 버튼을 비활성화한다', () => {
    mockMutationState.isPending = true;
    renderFlow();
    fireEvent.click(screen.getByRole('button', { name: '문의 등록' }));

    expect(screen.getByLabelText('문의 유형')).toBeDisabled();
    expect(screen.getByLabelText('제목')).toBeDisabled();
    expect(screen.getByLabelText('문의 내용')).toBeDisabled();
    expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '등록' })).toBeDisabled();
  });

  it('Backend InquiryType Enum에 대응하는 네 가지 문의 유형을 표시한다', () => {
    renderFlow();
    fireEvent.click(screen.getByRole('button', { name: '문의 등록' }));
    fireEvent.click(screen.getByLabelText('문의 유형'));

    expect(screen.getAllByRole('option')).toHaveLength(4);
    expect(screen.getByRole('option', { name: '오류' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '불편사항' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '기능 요청' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: '기타' })).toBeInTheDocument();
  });

  it('입력값을 실제 API 요청으로 전달하고 성공 배너를 표시한다', async () => {
    const onRegistrationSuccess = vi.fn();
    renderFlow(onRegistrationSuccess);
    fireEvent.click(screen.getByRole('button', { name: '문의 등록' }));
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: '등록' }));

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        inquiryType: 'ERROR',
        title: '서비스 문의',
        content: '서비스 이용 방법이 궁금합니다.',
      });
    });
    expect(screen.getByText('문의가 성공적으로 등록되었습니다.')).toBeInTheDocument();
    expect(screen.queryByRole('dialog', { name: '문의 등록' })).not.toBeInTheDocument();
    expect(onRegistrationSuccess).toHaveBeenCalledOnce();
  });

  it('등록 실패 배너를 표시하고 다시 열었을 때 입력값을 유지한다', async () => {
    mockMutateAsync.mockRejectedValueOnce(new Error('network error'));
    renderFlow();
    fireEvent.click(screen.getByRole('button', { name: '문의 등록' }));
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: '등록' }));

    await waitFor(() => {
      expect(
        screen.getByText('문의를 등록하지 못했습니다. 다시 시도해 주세요.'),
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '문의 등록' }));
    expect(screen.getByLabelText('문의 유형')).toHaveTextContent('오류');
    expect(screen.getByLabelText('제목')).toHaveValue('서비스 문의');
    expect(screen.getByLabelText('문의 내용')).toHaveValue('서비스 이용 방법이 궁금합니다.');
  });
});
